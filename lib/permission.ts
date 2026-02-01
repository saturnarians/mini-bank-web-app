import type { UserRole } from '@/lib/types'; 

type Permission = string | '*';

export const ROLE_PERMISSIONS:Record<UserRole, readonly Permission[]> = {
  superadmin: ['*'], // full access
  admin: [
    '/dashboard', 
    '/accounts', 
    '/admin', 
    '/admin-panel', 
    '/profile', 
    '/transactions',
    // Admin-specific actions
    '/api/admin/accounts/suspend',
    '/api/admin/accounts/resume',
    '/api/admin/accounts/create-balance',
    '/api/admin/transactions/history',
  ],
  user: ['/dashboard', '/accounts', '/profile', '/transactions'],
} as const;

export const ADMIN_ACTIONS = {
  SUSPEND_ACCOUNT: 'suspend_account',
  RESUME_ACCOUNT: 'resume_account',
  CREATE_BALANCE: 'create_balance',
  VIEW_TRANSACTION_HISTORY: 'view_transaction_history',
  CREATE_ADMIN: 'create_admin',
  SUSPEND_ADMIN: 'suspend_admin',
  RESUME_ADMIN: 'resume_admin',
} as const;

export type AdminAction = typeof ADMIN_ACTIONS[keyof typeof ADMIN_ACTIONS];

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

export function canPerformAdminAction(role: UserRole, action: AdminAction): boolean {
  if (role === 'superadmin') return true;
  if (role === 'admin') {
    // Admins can perform most actions except creating/managing other admins
    return action !== ADMIN_ACTIONS.CREATE_ADMIN && 
           action !== ADMIN_ACTIONS.SUSPEND_ADMIN &&
           action !== ADMIN_ACTIONS.RESUME_ADMIN;
  }
  return false;
}

export function isSuperAdmin(role: UserRole): boolean {
  return role === 'superadmin';
}

export function isAdmin(role: UserRole): boolean {
  return role === 'admin' || role === 'superadmin';
}