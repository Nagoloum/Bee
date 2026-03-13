"use client";

import { useSession } from "@/lib/auth/client";
import type { UserRole } from "@/types";

export function useAuth() {
  const { data: session, isPending } = useSession();

  const user = session?.user as {
    id:            string;
    name:          string;
    email:         string;
    image?:        string | null;
    role:          UserRole;
    phone?:        string;
    phoneVerified: boolean;
    emailVerified: boolean;
    region?:       string;
  } | undefined;

  return {
    user,
    session,
    isLoading:  isPending,
    isAuth:     !!user,
    isClient:   user?.role === "CLIENT",
    isVendor:   user?.role === "VENDOR",
    isDelivery: user?.role === "DELIVERY",
    isAdmin:    user?.role === "ADMIN",
    role:       user?.role ?? null,
  };
}
