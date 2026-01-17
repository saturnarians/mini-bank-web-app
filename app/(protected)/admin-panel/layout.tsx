'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAppSelector(state => state.auth);

  useEffect(() => {
    if (!isLoading && (!user || !['admin', 'superadmin'].includes(user.role))) {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  if (!user) return null;

  return <>{children}</>;
}
