"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { getCurrentUser } from "@/store/slices/auth-slice";
import { canAccessPage } from "@/lib/permission";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export function AuthGuard({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { user, hydrated, isAuthenticated, isLoading } = useAppSelector(
    (state) => state.auth,
  );

  console.log("GUARD CHECK", { isAuthenticated });
  //1. Ensure auth state is hydrated
  useEffect(() => {
    if (!user && !isLoading && hydrated && isAuthenticated) {
      dispatch(getCurrentUser());
    }
  }, [user, isLoading, dispatch, hydrated, isAuthenticated]);

  //2. Enforce access rules
  useEffect(() => {
    
    // Redirect only after hydration attempt
    if (!isLoading && !user) {
      router.replace("/login");
      return;
    }

    // Role-based redirect after auth
    if (!isLoading && user && !canAccessPage(user.role, pathname)) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Skeleton count={5} />
        <p className="ml-2 text-lg text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
