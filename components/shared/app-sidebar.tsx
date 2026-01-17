'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logoutUser } from '@/store/slices/auth-slice';
import { LayoutDashboard, CreditCard, TrendingUp, Users, Settings, LogOut, Menu, X, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
// import { hasPermission } from '@/lib/permission';
import { cn } from '@/lib/utils';

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push('/');
  };

  const menuItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      permission: 'view_dashboard',
    },
    {
      label: 'Accounts',
      href: '/dashboard/accounts',
      icon: CreditCard,
      permission: 'manage_accounts',
    },
    {
      label: 'Transactions',
      href: '/dashboard/transactions',
      icon: TrendingUp,
      permission: 'manage_transactions',
    },
    ...(user?.role === 'admin' || user?.role === 'superadmin' ? [{
      label: 'Admin Panel',
      href: '/admin-panel',
      icon: Users,
      permission: 'manage_users',
    }] : []),
    {
      label: 'Profile',
      href: '/dashboard/profile',
      icon: Settings,
      permission: 'view_profile',
    },
  ];

  const visibleMenuItems = menuItems.filter(
    item => user //&& hasPermission(user.role, item.permission)
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 hover:bg-muted rounded-lg"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen w-64 bg-card border-r border-border transition-transform duration-300 flex flex-col md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-lg font-bold">Mini Bank</h1>
              <p className="text-xs text-muted-foreground">Banking Platform</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                )}
              >
                <Icon className="h-5 w-5 flex shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info and Logout */}
        <div className="p-4 border-t border-border space-y-4">
          <div className="px-4 py-2 rounded-lg bg-muted">
            <p className="text-xs text-muted-foreground">Logged in as</p>
            <p className="text-sm font-semibold truncate">{user?.email}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content padding */}
      <div className="md:pl-64" />
    </>
  );
}
