import { UserRole } from '@/lib/types'

/**
 * Extend roles to include superadmin
 */
export type ExtendedUserRole = UserRole | 'superadmin'

/**
 * Central permission definition per role
 */
const ROLE_PERMISSIONS: Record<
  ExtendedUserRole,
  {
    actions: string[]
    pages: string[]
    canManageAdmins: boolean
    canManageUsers: boolean
  }
> = {
  superadmin: {
    actions: [
      'view_dashboard',
      'manage_accounts',
      'manage_transactions',
      'manage_users',
      'manage_admins',
      'view_profile',
      'logout',
    ],
    pages: ['/', '/dashboard', '/dashboard/accounts', '/dashboard/transactions', '/admin', '/dashboard/profile'],
    canManageAdmins: true,
    canManageUsers: true,
  },

  admin: {
    actions: [
      'view_dashboard',
      'manage_accounts',
      'manage_transactions',
      'manage_users',
      'view_profile',
      'logout',
    ],
    pages: ['/', '/dashboard', '/dashboard/accounts', '/dashboard/transactions', '/admin', '/dashboard/profile'],
    canManageAdmins: false,
    canManageUsers: true,
  },

  manager: {
    actions: [
      'view_dashboard',
      'manage_accounts',
      'manage_transactions',
      'view_profile',
      'logout',
    ],
    pages: ['/', '/dashboard', '/dashboard/accounts', '/dashboard/transactions', '/dashboard/profile'],
    canManageAdmins: false,
    canManageUsers: true,
  },

  user: {
    actions: [
      'view_dashboard',
      'manage_accounts',
      'manage_transactions',
      'view_profile',
      'logout',
    ],
    pages: ['/', '/dashboard', '/dashboard/accounts', '/dashboard/transactions', '/dashboard/profile'],
    canManageAdmins: false,
    canManageUsers: false,
  },
}

/* ============================
   ACTION PERMISSIONS
============================ */

export function hasPermission(
  userRole: ExtendedUserRole | null | undefined,
  action: string
): boolean {
  if (!userRole) return false
  return ROLE_PERMISSIONS[userRole]?.actions.includes(action) ?? false
}

/* ============================
   PAGE ACCESS
============================ */

export function canAccessPage(
  userRole: ExtendedUserRole | null | undefined,
  page: string
): boolean {
  if (!userRole) return false
  return ROLE_PERMISSIONS[userRole]?.pages.includes(page) ?? false
}

/* ============================
   ADMIN / ROLE MANAGEMENT
============================ */

export function canManageAdmins(userRole?: ExtendedUserRole | null): boolean {
  return ROLE_PERMISSIONS[userRole as ExtendedUserRole]?.canManageAdmins ?? false
}

export function canManageUsers(userRole?: ExtendedUserRole | null): boolean {
  return ROLE_PERMISSIONS[userRole as ExtendedUserRole]?.canManageUsers ?? false
}

/* ============================
   ROLE HELPERS
============================ */

export function isSuperAdmin(userRole?: string | null): boolean {
  return userRole === 'superadmin'
}

export function isAdmin(userRole?: string | null): boolean {
  return userRole === 'admin' || userRole === 'superadmin'
}
