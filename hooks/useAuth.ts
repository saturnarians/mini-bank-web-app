"use client";

import { useAppSelector } from "@/store/hooks";

/**
 * useAuth
 * - Central place for auth-derived UI decisions
 * - NEVER enforces security (backend does that)
 */
export function useAuth() {
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated
  );

  const role = user?.role ?? "guest";

  const isAdmin = role === "admin" || role === "superadmin";

  return {
    user,
    role,
    isAuthenticated,
    isAdmin,
  };
}
