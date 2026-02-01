import type { UserRole } from '@/lib/types'; 

type Permission = string | '*';

export const ROLE_PERMISSIONS:Record<UserRole, readonly Permission[]> = {
  superadmin: ['*'], // full access
  admin: ['/dashboard', '/accounts', '/admin', '/admin-panel', '/profile', '/transactions'],
  user: ['/dashboard', '/accounts', '/profile', '/transactions'],
} as const;

export function canAccessPage(role: UserRole, path: string): boolean {
  const allowedPaths = ROLE_PERMISSIONS[role];
  
  if (!allowedPaths) return false;

  // super admin shortcut
  if (allowedPaths.includes('*')) return true;

  // Check if any allowed path is a prefix of the current path
  return allowedPaths.some(allowedPath => 
    allowedPath !== '*' &&
    (path === allowedPath || path.startsWith(`${allowedPath}/`))
  );
}