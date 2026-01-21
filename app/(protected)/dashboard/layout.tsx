import { Metadata } from 'next';
import { AuthGuard } from '@/components/auth-guard';
import { AppSidebar } from '@/components/shared/app-sidebar';
import { DashboardHeader } from '@/components/shared/dashboard-header';
import { RoleGuard }from '@/components/roleGuard';

export const metadata: Metadata = {
  title: 'Dashboard - Mini Bank',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
     <AuthGuard> 
      <RoleGuard>
      <div className="flex bg-background">
        <AppSidebar />
        <div className="flex-1 md:ml-0">
          <DashboardHeader />
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
      </RoleGuard>
    </AuthGuard>
  );
}
