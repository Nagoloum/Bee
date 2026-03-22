import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const f = createUploadthing();

// Auth middleware helper
async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export const ourFileRouter = {

  // ─── Avatar utilisateur (profil) ───────────────────────────────────────────
  userAvatar: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await getSession();
      if (!session) throw new Error("Non autorisé");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const url = file.ufsUrl ?? file.url;
      console.log("[UT] Avatar uploaded:", url, "for user:", metadata.userId);
      return { url };
    }),

  // ─── Logo / avatar boutique vendeur ────────────────────────────────────────
  vendorLogo: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await getSession();
      if (!session) throw new Error("Non autorisé");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const url = file.ufsUrl ?? file.url;
      console.log("[UT] Vendor logo uploaded:", url);
      return { url };
    }),

  // ─── Bannière boutique vendeur ─────────────────────────────────────────────
  vendorBanner: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await getSession();
      if (!session) throw new Error("Non autorisé");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const url = file.ufsUrl ?? file.url;
      console.log("[UT] Vendor banner uploaded:", url);
      return { url };
    }),

  // ─── Photos de produit (max 5) ─────────────────────────────────────────────
  productImages: f({ image: { maxFileSize: "2MB", maxFileCount: 5 } })
    .middleware(async () => {
      const session = await getSession();
      if (!session) throw new Error("Non autorisé");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const url = file.ufsUrl ?? file.url;
      console.log("[UT] Product image uploaded:", url);
      return { url };
    }),

  // ─── Preuve de livraison (livreur) ─────────────────────────────────────────
  deliveryProof: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await getSession();
      if (!session) throw new Error("Non autorisé");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const url = file.ufsUrl ?? file.url;
      console.log("[UT] Delivery proof uploaded:", url);
      return { url };
    }),

  // ─── Photos pour les avis produits ────────────────────────────────────────
  reviewImages: f({ image: { maxFileSize: "2MB", maxFileCount: 3 } })
    .middleware(async () => {
      const session = await getSession();
      if (!session) throw new Error("Non autorisé");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const url = file.ufsUrl ?? file.url;
      console.log("[UT] Review image uploaded:", url);
      return { url };
    }),

} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
