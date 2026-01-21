"use client";

import { usePathname } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import Unauthorized from "@/components/unauthorized";
import { canAccessPage } from "@/lib/permission";

export function RoleGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAppSelector((s) => s.auth);
  const pathname = usePathname();

  if (!user) return null;

  if (!canAccessPage(user.role, pathname)) {
    return <Unauthorized />;
  }

  return <>{children}</>;
}
