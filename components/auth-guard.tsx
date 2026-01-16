'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { getCurrentUser } from '@/store/slices/auth-slice';
import { canAccessPage } from '@/lib/permission';

export function AuthGuard({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAppSelector(state => state.auth);

  useEffect(() => {
    // Only fetch if we aren't authenticated and not already loading
    if (!isAuthenticated && !isLoading) {
      dispatch(getCurrentUser());
    }
  }, [isAuthenticated, isLoading, dispatch]);

  useEffect(() => {
    // If loading is done and we are still not authenticated, go home
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }

    // Role-based redirect
    if (user && !canAccessPage(user.role, pathname)) {
      router.push('/dashboard');
    }
  }, [user, isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return <>{children}</>;
}