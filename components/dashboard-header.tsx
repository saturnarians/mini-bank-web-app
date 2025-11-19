'use client';

import { useAppSelector } from '@/lib/hooks';

export function DashboardHeader() {
  const { user } = useAppSelector(state => state.auth);

  return (
    <div className="border-b border-border bg-card sticky top-0 z-10">
      <div className="px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]}</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
