'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { AuthGuard } from '@/components/auth-guard';
import { RoleGuard } from '@/components/roleGuard';
import { AppSidebar } from  '@/components/admins/admin-sidebar';
import {DashboardHeader } from  '@/components/admins/admin-header';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isLoading, hydrated } = useAppSelector(state => state.auth);

  useEffect(() => {
    // Wait until auth state is hydrated before making redirect decisions
    if (hydrated && !isLoading && (!user || !['admin', 'superadmin'].includes(user.role))) {
      router.replace('/dashboard');
    }
  }, [user, isLoading, hydrated, router]);

  if (!user) return null;

  return (
  <AuthGuard> 
  <RoleGuard>
  <>
  <div className="flex bg-background">
        <AppSidebar />
        <div className="flex-1 md:ml-0">
          <DashboardHeader />
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
  </>
  </RoleGuard>
  </AuthGuard>
  )
}
