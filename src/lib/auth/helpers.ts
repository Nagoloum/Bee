import { headers } from "next/headers";
import { auth } from "./index";
import type { UserRole } from "@/types";

// Get the current session on the server
export async function getServerSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

// Get user or redirect
export async function requireAuth() {
  const session = await getServerSession();
  if (!session) return null;
  return session;
}

// Check if user has required role
export async function requireRole(allowedRoles: UserRole[]) {
  const session = await getServerSession();
  if (!session) return null;

  const userRole = (session.user as any).role as UserRole;
  if (!allowedRoles.includes(userRole)) return null;

  return session;
}

// Get redirect path based on role
export function getRoleRedirect(role: UserRole): string {
  switch (role) {
    case "VENDOR":   return "/vendor";
    case "DELIVERY": return "/delivery";
    case "ADMIN":    return "/admin";
    default:         return "/";
  }
}
