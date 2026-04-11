import { NextRequest } from "next/server";

/**
 * Lit la session Better-Auth depuis les cookies dans le contexte middleware.
 * Le middleware ne peut pas utiliser les Server Components ou db — on lit le cookie JWT.
 *
 * Destination : src/lib/auth/middleware-helper.ts
 */
export async function getSessionFromRequest(
  req: NextRequest
): Promise<{ user: { id: string; role: string; email: string } } | null> {
  try {
    // Better-Auth stocke la session dans un cookie "better-auth.session_token"
    const sessionToken =
      req.cookies.get("better-auth.session_token")?.value ??
      req.cookies.get("__Secure-better-auth.session_token")?.value;

    if (!sessionToken) return null;

    // Appel à l'endpoint de session interne Better-Auth
    const url = new URL("/api/auth/get-session", req.url);
    const res = await fetch(url.toString(), {
      headers: {
        cookie: `better-auth.session_token=${sessionToken}`,
        "x-forwarded-for": req.headers.get("x-forwarded-for") ?? "127.0.0.1",
      },
      cache: "no-store",
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data?.user) return null;

    return {
      user: {
        id:    data.user.id,
        role:  data.user.role ?? "CLIENT",
        email: data.user.email,
      },
    };
  } catch {
    return null;
  }
}
