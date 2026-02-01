import { UserRole } from '@/lib/types';

export function resolveDashboardByRole(role: UserRole) {
  switch (role) {
    case 'superadmin':
    case 'admin':
      return '/admin-panel';
    case 'user':
    default:
      return '/dashboard';
  }
}

// export function resolveDashboardByRole(role: UserRole) {
//   if (role === 'superadmin' || role === 'admin') return '/admin-panel';
//   return '/dashboard';
// }
