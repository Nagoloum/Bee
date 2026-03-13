import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./src/lib/i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Routes that require authentication
const protectedRoutes = {
  "/vendor":   ["VENDOR"],
  "/delivery": ["DELIVERY"],
  "/admin":    ["ADMIN"],
  "/account":  ["CLIENT", "VENDOR", "DELIVERY", "ADMIN"],
  "/orders":   ["CLIENT", "VENDOR", "DELIVERY", "ADMIN"],
};

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Apply i18n middleware
  const response = intlMiddleware(request);

  // Check authentication for protected routes
  const sessionCookie =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__Secure-better-auth.session_token");

  const strippedPath = pathname.replace(/^\/(fr|en)/, "");

  for (const [route] of Object.entries(protectedRoutes)) {
    if (strippedPath.startsWith(route)) {
      if (!sessionCookie) {
        const url = new URL("/sign-in", request.url);
        url.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(url);
      }
      break;
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
