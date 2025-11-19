'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { getCurrentUser } from '@/lib/slices/auth-slice';
import { canAccessPage } from '@/lib/utils/permission';
import { Spinner } from '@/components/ui/spinner';

interface AuthGuardProps {
  children: ReactNode;
  requiredPage?: string;
}

export function AuthGuard({ children, requiredPage = '/' }: AuthGuardProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAppSelector(state => state.auth);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      dispatch(getCurrentUser()).catch(() => {
        router.push('/');
      });
    }
  }, []);

  useEffect(() => {
    if (user && !canAccessPage(user.role, requiredPage)) {
      router.push('/dashboard');
    }
  }, [user, requiredPage, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner className="h-8 w-8 mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
