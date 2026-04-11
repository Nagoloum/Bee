import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/middleware-helper";

// ─── Routes protégées par rôle ────────────────────────────────────────────────

const PUBLIC_ROUTES = [
  "/", "/sign-in", "/sign-up", "/products", "/shops", "/categories",
  "/flash-sales", "/jobs", "/referral", "/legal", "/contact",
  "/api/auth", "/api/uploadthing", "/api/jobs", "/api/reviews",
  "/api/products", "/api/categories", "/api/vendors", "/api/orders/webhook",
  "/_next", "/favicon", "/robots.txt", "/sitemap.xml",
];

const ROLE_ROUTES: Record<string, string[]> = {
  VENDOR:   ["/vendor"],
  DELIVERY: ["/delivery"],
  ADMIN:    ["/admin"],
};

const AUTH_REQUIRED = [
  "/cart", "/checkout", "/orders", "/wallet", "/account",
  "/api/orders", "/api/disputes", "/api/reviews",
  "/api/delivery", "/api/vendor", "/api/referral",
  "/api/admin", "/api/verify",
];

function isPublic(pathname: string): boolean {
  return PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(r + "/") || pathname.startsWith(r + "?"));
}

function requiresAuth(pathname: string): boolean {
  return AUTH_REQUIRED.some(r => pathname === r || pathname.startsWith(r + "/") || pathname.startsWith(r + "?"));
}

function requiredRole(pathname: string): string | null {
  for (const [role, prefixes] of Object.entries(ROLE_ROUTES)) {
    if (prefixes.some(p => pathname === p || pathname.startsWith(p + "/") || pathname.startsWith(p + "?"))) {
      return role;
    }
  }
  return null;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Toujours laisser passer les routes publiques et assets
  if (isPublic(pathname)) return NextResponse.next();

  const neededRole = requiredRole(pathname);
  const needsAuth  = requiresAuth(pathname) || !!neededRole;

  if (!needsAuth) return NextResponse.next();

  // Lire la session depuis le cookie Better-Auth
  let session: { user?: { role?: string } } | null = null;
  try {
    session = await getSessionFromRequest(req);
  } catch {
    session = null;
  }

  // Non connecté → /sign-in avec retour URL
  if (!session?.user) {
    const loginUrl = new URL("/sign-in", req.url);
    // Ne pas passer callbackUrl pour les routes API
    if (!pathname.startsWith("/api/")) {
      loginUrl.searchParams.set("callbackUrl", pathname);
    }
    return pathname.startsWith("/api/")
      ? NextResponse.json({ error: "Non autorisé" }, { status: 401 })
      : NextResponse.redirect(loginUrl);
  }

  const role = session.user.role;

  // Mauvais rôle → page d'accueil avec message
  if (neededRole && role !== neededRole && role !== "ADMIN") {
    // Les admins ont accès partout sauf /delivery et /vendor (confusion UX)
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    const home = new URL("/", req.url);
    home.searchParams.set("error", "access_denied");
    return NextResponse.redirect(home);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Matcher : toutes les routes sauf :
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation images)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2)).*)",
  ],
};
