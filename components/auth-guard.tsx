
"use client";

import { ReactNode, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { getCurrentUser } from "@/store/slices/auth-slice";
import { canAccessPage } from "@/lib/permission";
import Unauthorized from "@/components/unauthorized";

export function AuthGuard({ children }: { children: ReactNode }) {

  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isLoading, isAuthenticated, hydrated } = useAppSelector((s) => s.auth);
  const retriedAfterHydrationRef = useRef(false);

  // Ensure we always attempt to hydrate auth state on client render
  useEffect(() => {
    if (!hydrated) dispatch(getCurrentUser());
  }, [hydrated, dispatch]);

  // After hydration, retry auth hydration once before redirecting to login.
  useEffect(() => {
    if (!hydrated || isAuthenticated) {
      retriedAfterHydrationRef.current = false;
      return;
    }

    if (!retriedAfterHydrationRef.current) {
      retriedAfterHydrationRef.current = true;
      dispatch(getCurrentUser());
      return;
    }

    router.replace('/login');
  }, [hydrated, isAuthenticated, dispatch, router]);

  // While hydrating or any loading request is in progress, show a loader
  if (!hydrated || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">Loading session…</div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex h-screen items-center justify-center">Redirecting to login…</div>
    );
  }

  // Role-based access
  if (!canAccessPage(user.role, pathname)) {
    return <Unauthorized />;
  }

  return <>{children}</>;
}
