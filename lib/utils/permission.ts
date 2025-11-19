import { UserRole } from '@/lib/types';

export const hasPermission = (userRole: UserRole, action: string): boolean => {
  const permissions: Record<UserRole, string[]> = {
    admin: ['view_dashboard', 'manage_accounts', 'manage_transactions', 'manage_users', 'view_profile', 'logout'],
    manager: ['view_dashboard', 'manage_accounts', 'manage_transactions', 'view_profile', 'logout'],
    user: ['view_dashboard', 'manage_accounts', 'manage_transactions', 'view_profile', 'logout'],
  };

  return permissions[userRole]?.includes(action) || false;
};

export const canAccessPage = (userRole: UserRole, page: string): boolean => {
  const pageAccess: Record<UserRole, string[]> = {
    admin: ['/', '/dashboard', '/accounts', '/transactions', '/admin', '/profile'],
    manager: ['/', '/dashboard', '/accounts', '/transactions', '/profile'],
    user: ['/', '/dashboard', '/accounts', '/transactions', '/profile'],
  };

  return pageAccess[userRole]?.includes(page) || false;
};
