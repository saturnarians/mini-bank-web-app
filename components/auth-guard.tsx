// "use client";

// import { ReactNode, useEffect } from "react";
// import { usePathname } from "next/navigation";
// import { useAppSelector, useAppDispatch } from "@/store/hooks";
// import { getCurrentUser } from "@/store/slices/auth-slice";
// import { canAccessPage } from "@/lib/permission";
// import Unauthorized from "@/components/unauthorized";
// import Skeleton from 'react-loading-skeleton'
// import 'react-loading-skeleton/dist/skeleton.css'


//AuthGate
//export function AuthGuard({ children }: { children: ReactNode }) {
//   const dispatch = useAppDispatch();
//   const router = useRouter();
//   const pathname = usePathname();
//   const { user, hydrated, isAuthenticated, isLoading } = useAppSelector(
//     (state) => state.auth,
//   );

//   //1. Ensure auth state is hydrated
//   // useEffect(() => {
//   //   if (!user && !isLoading && hydrated && isAuthenticated) {
//   //     dispatch(getCurrentUser());
//   //   }
//   // }, [user, isLoading, dispatch, hydrated, isAuthenticated]);

//   useEffect(() => {
//   if (!hydrated) {
//     dispatch(getCurrentUser());
//   }
// }, [hydrated, dispatch]);

//   //2. Enforce access rules
//   useEffect(() => {
    
//     // Redirect only after hydration attempt
//     // if (!isLoading && !user) {
//     //   router.replace("/login");
//     //   return;
//     // }

//     // Role-based redirect after auth
//     if (!isLoading && user && !canAccessPage(user.role, pathname)) {
//       router.replace("/dashboard");
//     }
//   }, [user, isLoading, pathname, router]);

//   if (isLoading) {
//     return (
//       <div className="flex h-screen items-center justify-center">
//         <Skeleton count={5} />
//         <p className="ml-2 text-lg text-muted-foreground">Loading...</p>
//       </div>
//     );
//   }

//   return <>{children}</>;

"use client";

import { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { getCurrentUser } from "@/store/slices/auth-slice";
import { canAccessPage } from "@/lib/permission";
import Unauthorized from "@/components/unauthorized";

export function AuthGuard({ children }: { children: ReactNode }) {

  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user, isLoading, isAuthenticated, hydrated } = useAppSelector((s) => s.auth);

  console.log("GUARD CHECK", { isAuthenticated });

  if (isLoading && !isAuthenticated || !user) {
    // not logged in → redirect to login
    return null; // let AuthGuard handle redirect
  }

  if (isLoading && !canAccessPage(user.role, pathname)) {
    return <Unauthorized />; // role mismatch
  }

  useEffect(() => {
    if (!hydrated) {
      dispatch(getCurrentUser());
    }
  }, [hydrated, dispatch]);
  

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading session…
      </div>
    );
  }

  return <>{children}</>;
}
