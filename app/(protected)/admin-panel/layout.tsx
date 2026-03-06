'use client';

import { ReactNode } from 'react';
import { AuthGuard } from '@/components/auth-guard';
import { RoleGuard } from '@/components/roleGuard';
import { AppSidebar } from  '@/components/admins/admin-sidebar';
import {DashboardHeader } from  '@/components/admins/admin-header';

export default function AdminLayout({ children }: { children: ReactNode }) {
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
