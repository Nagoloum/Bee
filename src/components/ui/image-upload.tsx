"use client";

import React, { useState, useRef, useCallback } from "react";
import { Upload, X, Camera, FolderOpen, Loader2, AlertCircle } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing/client";
import { cn } from "@/lib/utils/cn";

type UploadEndpoint =
  | "userAvatar"
  | "vendorLogo"
  | "vendorBanner"
  | "productImages"
  | "deliveryProof"
  | "reviewImages";

interface ImageUploadProps {
  endpoint:    UploadEndpoint;
  value?:      string | string[];
  onChange:    (url: string | string[]) => void;
  multiple?:   boolean;
  maxFiles?:   number;
  label?:      string;
  hint?:       string;
  className?:  string;
  shape?:      "square" | "circle" | "banner";
  // Context for filename generation
  fileNameContext?: {
    userName?:  string;
    userEmail?: string;
    shopName?:  string;
    productName?: string;
  };
  // Callback when old image should be deleted
  onDeleteOld?: (oldUrl: string) => Promise<void>;
}

const MAX_MB    = 2;
const MAX_BYTES = MAX_MB * 1024 * 1024;

// ─── Slugify for filenames ────────────────────────────────────────────────────

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9@._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── Generate meaningful filename ────────────────────────────────────────────

function generateFileName(
  endpoint: UploadEndpoint,
  file: File,
  ctx: ImageUploadProps["fileNameContext"] = {}
): string {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";

  switch (endpoint) {
    case "userAvatar": {
      const name  = toSlug(ctx.userName  ?? "user");
      const email = toSlug(ctx.userEmail ?? "");
      return email ? `${name}-${email}-avatar.${ext}` : `${name}-avatar.${ext}`;
    }
    case "vendorLogo": {
      const shop = toSlug(ctx.shopName ?? ctx.userName ?? "shop");
      return `${shop}-logo.${ext}`;
    }
    case "vendorBanner": {
      const shop = toSlug(ctx.shopName ?? ctx.userName ?? "shop");
      return `${shop}-banner.${ext}`;
    }
    case "productImages": {
      const product = toSlug(ctx.productName ?? "product");
      const ts = Date.now();
      return `${product}-${ts}.${ext}`;
    }
    case "deliveryProof": {
      const name = toSlug(ctx.userName ?? "livreur");
      return `${name}-delivery-proof-${Date.now()}.${ext}`;
    }
    case "reviewImages": {
      const name = toSlug(ctx.userName ?? "user");
      return `${name}-review-${Date.now()}.${ext}`;
    }
    default:
      return `${endpoint}-${Date.now()}.${ext}`;
  }
}

// ─── Client-side compression ──────────────────────────────────────────────────

async function compressImage(file: File, targetName: string): Promise<File> {
  return new Promise((resolve) => {
    if (file.size <= MAX_BYTES) {
      resolve(new File([file], targetName, { type: file.type }));
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      let { width, height } = img;
      const maxDim = 1920;
      if (width > maxDim || height > maxDim) {
        const r = Math.min(maxDim / width, maxDim / height);
        width  = Math.round(width * r);
        height = Math.round(height * r);
      }
      const canvas = document.createElement("canvas");
      canvas.width  = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);

      // Use .jpg extension for compressed output
      const jpgName = targetName.replace(/\.[^.]+$/, ".jpg");
      let quality = 0.85;

      const tryNext = () => {
        canvas.toBlob((blob) => {
          if (!blob) { resolve(new File([file], jpgName, { type: "image/jpeg" })); return; }
          if (blob.size <= MAX_BYTES || quality <= 0.3) {
            resolve(new File([blob], jpgName, { type: "image/jpeg" }));
          } else {
            quality -= 0.1;
            tryNext();
          }
        }, "image/jpeg", quality);
      };
      tryNext();
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(new File([file], targetName, { type: file.type }));
    };
    img.src = url;
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ImageUpload({
  endpoint, value, onChange, multiple = false, maxFiles = 1,
  label, hint, className, shape = "square",
  fileNameContext = {}, onDeleteOld,
}: ImageUploadProps) {
  const [dragging,  setDragging]  = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [error,     setError]     = useState("");

  const fileRef   = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const urls   = Array.isArray(value) ? value : (value ? [value] : []);
  const canAdd = urls.length < maxFiles;

  const { startUpload } = useUploadThing(endpoint, {
    onUploadProgress: (p) => setProgress(p),
    onClientUploadComplete: (res) => {
      const newUrls = res?.map((r) => r.ufsUrl ?? r.url) ?? [];
      if (multiple) onChange([...urls, ...newUrls]);
      else onChange(newUrls[0] ?? "");
      setUploading(false);
      setProgress(0);
    },
    onUploadError: (err) => {
      setError(err.message ?? "Upload échoué. Vérifiez UPLOADTHING_SECRET dans .env.local");
      setUploading(false);
      setProgress(0);
    },
  });

  const processFiles = useCallback(async (rawFiles: FileList | File[]) => {
    setError("");
    const files = Array.from(rawFiles).filter(f => f.type.startsWith("image/"));
    if (!files.length)                                    { setError("Seules les images sont acceptées."); return; }
    if (urls.length + files.length > maxFiles)            { setError(`Maximum ${maxFiles} image${maxFiles > 1 ? "s" : ""}.`); return; }
    if (files.some(f => f.size > 10 * 1024 * 1024))      { setError("Image trop volumineuse (max 10 Mo brut)."); return; }

    setUploading(true);
    setProgress(5);

    try {
      // Generate meaningful filenames + compress
      const prepared = await Promise.all(
        files.map((file, i) => {
          const name = generateFileName(
            endpoint,
            file,
            // For multiple images, add index suffix
            files.length > 1
              ? { ...fileNameContext, productName: fileNameContext.productName ? `${fileNameContext.productName}-${i + 1}` : undefined }
              : fileNameContext
          );
          return compressImage(file, name);
        })
      );

      setProgress(20);

      const stillBig = prepared.find(f => f.size > MAX_BYTES);
      if (stillBig) {
        setError(`Impossible de compresser sous ${MAX_MB} Mo. Choisissez une autre image.`);
        setUploading(false);
        setProgress(0);
        return;
      }

      await startUpload(prepared);
    } catch (err: any) {
      setError(err?.message ?? "Erreur inattendue lors de l'upload.");
      setUploading(false);
      setProgress(0);
    }
  }, [urls, maxFiles, endpoint, fileNameContext, startUpload]);

  const removeImage = async (url: string) => {
    // Delete from UploadThing via API if callback provided
    if (onDeleteOld) {
      try { await onDeleteOld(url); } catch (e) { console.warn("[ImageUpload] onDeleteOld failed:", e); }
    }
    if (multiple) onChange(urls.filter(u => u !== url));
    else onChange("");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const shapeClass = { square: "rounded-2xl", circle: "rounded-full", banner: "rounded-2xl" }[shape];

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <p className="text-sm font-semibold font-poppins text-foreground">
          {label}
          {maxFiles > 1 && (
            <span className="ml-2 text-xs font-normal text-muted-foreground font-inter">
              ({urls.length}/{maxFiles})
            </span>
          )}
        </p>
      )}

      {/* Previews */}
      {urls.length > 0 && (
        <div className={cn("flex flex-wrap gap-3", shape === "banner" && "w-full")}>
          {urls.map((url) => (
            <div key={url} className={cn(
              "relative group overflow-hidden border-2 border-border",
              shape === "banner" ? "w-full aspect-[3/1]" : "w-24 h-24",
              shapeClass
            )}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="Preview" className="w-full h-full object-cover" />
              <button type="button" onClick={() => removeImage(url)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-error text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-soft">
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {canAdd && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onClick={() => !uploading && fileRef.current?.click()}
          className={cn(
            "border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center gap-2",
            !uploading && "cursor-pointer",
            shape === "banner" ? "w-full min-h-[110px] p-5" : "min-h-[90px] p-5",
            shapeClass,
            dragging   ? "border-primary bg-primary/5 scale-[1.01]"
            : uploading ? "border-primary/40 bg-muted/60"
            : "border-border bg-muted/40 hover:border-primary hover:bg-primary/5"
          )}>
          {uploading ? (
            <>
              <Loader2 size={22} className="text-primary animate-spin" />
              <div className="w-full max-w-[150px]">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }} />
                </div>
                <p className="text-[11px] text-muted-foreground font-inter text-center mt-1">
                  {progress < 25 ? "Compression & renommage…" : progress < 80 ? "Upload…" : "Finalisation…"}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Upload size={16} className="text-primary" />
              </div>
              {shape !== "circle" && (
                <p className="text-xs text-muted-foreground font-inter text-center leading-relaxed">
                  <span className="font-semibold text-foreground">Cliquez ou glissez</span><br />
                  Max {MAX_MB} Mo · JPG, PNG, WebP
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* Action buttons */}
      {canAdd && !uploading && (
        <div className="flex gap-2 flex-wrap">
          <button type="button" onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted hover:bg-muted/80 text-xs font-semibold font-poppins text-foreground transition-colors">
            <FolderOpen size={13} /> Parcourir
          </button>
          <button type="button" onClick={() => cameraRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted hover:bg-muted/80 text-xs font-semibold font-poppins text-foreground transition-colors">
            <Camera size={13} /> Caméra
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 text-xs text-error font-inter bg-error/5 border border-error/20 rounded-xl px-3 py-2">
          <AlertCircle size={12} className="shrink-0 mt-0.5" />
          <span className="flex-1">{error}</span>
          <button type="button" onClick={() => setError("")}><X size={11} /></button>
        </div>
      )}
      {hint && !error && <p className="text-xs text-muted-foreground font-inter">{hint}</p>}

      <input ref={fileRef} type="file" accept="image/*"
        multiple={multiple && maxFiles > 1} className="hidden"
        onChange={e => e.target.files?.length && processFiles(e.target.files)} />
      <input ref={cameraRef} type="file" accept="image/*"
        capture="environment" className="hidden"
        onChange={e => e.target.files?.length && processFiles(e.target.files)} />
    </div>
  );
}

// ─── Avatar Upload ─────────────────────────────────────────────────────────────

interface AvatarUploadProps {
  value?:    string | null;
  name?:     string;
  email?:    string;
  onChange:  (url: string) => void;
  endpoint?: UploadEndpoint;
  size?:     "sm" | "md" | "lg";
  className?: string;
}

export function AvatarUpload({
  value, name, email, onChange,
  endpoint = "userAvatar", size = "md", className,
}: AvatarUploadProps) {
  const sizeClass  = { sm: "w-16 h-16", md: "w-24 h-24", lg: "w-32 h-32" }[size];
  const initials   = name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "?";

  // Delete old avatar from UploadThing + update DB when replaced
  const handleDeleteOld = async (oldUrl: string) => {
    await fetch("/api/user/avatar", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: null }),
    });
  };

  const handleChange = async (url: string | string[]) => {
    const newUrl = url as string;
    // Save new avatar URL to DB
    await fetch("/api/user/avatar", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: newUrl }),
    }).catch(console.warn);
    onChange(newUrl);
  };

  return (
    <div className={cn("relative", sizeClass, className)}>
      {!value && (
        <div className={cn(
          "absolute inset-0 rounded-full bg-honey-100 flex items-center justify-center",
          "font-poppins font-bold text-honey-700 border-2 border-dashed border-honey-300 pointer-events-none z-10",
          sizeClass
        )}>
          {initials}
        </div>
      )}
      <ImageUpload
        endpoint={endpoint}
        value={value ?? undefined}
        onChange={handleChange}
        onDeleteOld={handleDeleteOld}
        shape="circle"
        maxFiles={1}
        fileNameContext={{ userName: name, userEmail: email }}
        className={cn(sizeClass, "relative z-20")}
      />
    </div>
  );
}
