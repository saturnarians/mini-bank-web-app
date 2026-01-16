export const ROLE_PERMISSIONS = {
  admin: ['/dashboard', '/accounts', '/admin', '/profile', '/transactions'],
  user: ['/dashboard', '/accounts', '/profile', '/transactions'],
} as const;

export function canAccessPage(role: string, path: string): boolean {
  const allowedPaths = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [];
  // Check if any allowed path is a prefix of the current path
  return allowedPaths.some(allowedPath => path.startsWith(allowedPath));
}