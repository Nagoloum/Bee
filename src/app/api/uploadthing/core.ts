import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const f = createUploadthing();

async function requireAdmin() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || (session.user as any).role !== "ADMIN") return null;
    return session;
}

export const ourFileRouter = {
    // ── Images produits (existant) ───────────────────────────────────────────
    productImage: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
        .middleware(async () => {
            const session = await auth.api.getSession({ headers: await headers() });
            if (!session) throw new Error("Non autorisé");
            return { userId: (session.user as any).id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            return { url: file.url };
        }),

    // ── Image logo boutique vendeur (existant) ───────────────────────────────
    vendorLogo: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
        .middleware(async () => {
            const session = await auth.api.getSession({ headers: await headers() });
            if (!session) throw new Error("Non autorisé");
            return { userId: (session.user as any).id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            return { url: file.url };
        }),

    // ── Banner boutique vendeur (existant) ───────────────────────────────────
    vendorBanner: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
        .middleware(async () => {
            const session = await auth.api.getSession({ headers: await headers() });
            if (!session) throw new Error("Non autorisé");
            return { userId: (session.user as any).id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            return { url: file.url };
        }),

    // ✅ NOUVEAU — Image de catégorie (admin seulement)
    categoryImage: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
        .middleware(async () => {
            const session = await requireAdmin();
            if (!session) throw new Error("Non autorisé — admin requis");
            return { userId: (session.user as any).id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            // L'URL est retournée au client pour être sauvegardée dans la DB
            return { url: file.url };
        }),

    // ✅ NOUVEAU — Bannières CMS homepage (admin seulement)
    promoBanner: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
        .middleware(async () => {
            const session = await requireAdmin();
            if (!session) throw new Error("Non autorisé — admin requis");
            return { userId: (session.user as any).id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            return { url: file.url };
        }),

} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;