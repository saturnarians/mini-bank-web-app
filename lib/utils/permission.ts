/**
 * The above TypeScript code defines functions to check if a user role has permission for a specific
 * action and if a user role can access a specific page.
 * @param {UserRole} userRole - The `userRole` parameter represents the role of the user trying to
 * perform an action or access a page. The possible user roles in this code snippet are `superadmin`,
 * `admin`, `manager`, and `user`.
 * @param {string} action - The `action` parameter in the `hasPermission` function represents the
 * specific action that a user may or may not have permission to perform based on their role. Examples
 * of actions in this context could be 'view_dashboard', 'manage_accounts', 'manage_transactions',
 * 'view_profile', or 'logout'.
 * @returns The `hasPermission` function checks if a user with a specific role has permission to
 * perform a certain action. It returns a boolean value indicating whether the user with the given role
 * has permission to perform the specified action.
 */
// import { UserRole } from '@/lib/types';

// export const hasPermission = (userRole: UserRole, action: string): boolean => {
//   const permissions: Record<UserRole, string[]> = {
//     admin: ['view_dashboard', 'manage_accounts', 'manage_transactions', 'manage_users', 'view_profile', 'logout'],
//     manager: ['view_dashboard', 'manage_accounts', 'manage_transactions', 'view_profile', 'logout'],
//     user: ['view_dashboard', 'manage_accounts', 'manage_transactions', 'view_profile', 'logout'],
//   };

//   return permissions[userRole]?.includes(action) || false;
// };

// export const canAccessPage = (userRole: UserRole, page: string): boolean => {
//   const pageAccess: Record<UserRole, string[]> = {
//     admin: ['/', '/dashboard', '/accounts', '/transactions', '/admin', '/profile'],
//     manager: ['/', '/dashboard', '/accounts', '/transactions', '/profile'],
//     user: ['/', '/dashboard', '/accounts', '/transactions', '/profile'],
//   };

//   return pageAccess[userRole]?.includes(page) || false;
// };
