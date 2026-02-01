
"use client";

import { ReactNode, useEffect } from "react";
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
  
  console.debug('GUARD TIMING', { hydrated, isLoading, isAuthenticated, userId: user?.id });

  // Ensure we always attempt to hydrate auth state on client render
  useEffect(() => {
    if (!hydrated) dispatch(getCurrentUser());
  }, [hydrated, dispatch]);

  // After hydration finished: redirect client to login if unauthenticated.
  // This effect must be registered unconditionally to keep hooks order stable.
  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace('/login');
    }
  }, [hydrated, isAuthenticated, router]);

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
