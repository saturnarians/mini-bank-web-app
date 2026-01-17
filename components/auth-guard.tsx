"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { getCurrentUser } from "@/store/slices/auth-slice";
import { canAccessPage } from "@/lib/permission";

export function AuthGuard({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAppSelector(
    (state) => state.auth
  );

   console.log("GUARD CHECK", { isAuthenticated })
  //1. Ensure auth state is hydrated
  useEffect(() => {
    if (!user && !isLoading) {
      dispatch(getCurrentUser());
    }
  }, [user, isLoading, dispatch]);

  //2. Enforce access rules
  useEffect(() => {
// Redirect only after hydration attempt
if (!isLoading && !user) {
  router.replace('/login');
  return;
}

    // Role-based redirect
    //   if (user && !canAccessPage(user.role, pathname)) {
    //     router.replace('/dashboard');
    //   }

    if (
      user &&
      pathname !== "/dashboard" &&
      !canAccessPage(user.role, pathname)
    ) {
      router.replace("/dashboard");
    }
  }, [user, isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
