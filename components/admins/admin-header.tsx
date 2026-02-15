'use client';

import Link from 'next/link';
import React from 'react';
import { usePathname } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { ToggleTheme } from "@/components/toggleTheme";
// import { canAccessPage } from '@/lib/permission';

// const NAV_ITEMS = [
//   { name: 'Dashboard', href: '/dashboard' },
//   { name: 'Accounts', href: '/accounts' },
//   { name: 'Transactions', href: '/transactions' },
//   { name: 'Admin Panel', href: '/admin-panel' }, // Sensitive link
// ];

export function DashboardHeader() {
  const pathname = usePathname();
  const { user } = useAppSelector(state => state.auth);

  const MemoToggleTheme = React.memo(ToggleTheme);

  return (
    // <nav className="flex gap-4 p-4 bg-white border-b">
    //   {NAV_ITEMS.map((item) => {
    //     // 1. Check if the current user's role is allowed to see this link
    //     if (user && !canAccessPage(user.role, item.href)) {
    //       return null; // Skip rendering this link
    //     }

    //     const isActive = pathname === item.href;

    //     return (
    //       <Link 
    //         key={item.href} 
    //         href={item.href}
    //         className={isActive ? "text-blue-600 font-bold" : "text-gray-600"}
    //       >
    //         {item.name}
    //       </Link>
    //     );
    //   })}
    // </nav>
    <div className="border-b border-border backdrop-blur bg-card sticky top-0 z-10">
      <div className="px-6 py-4 flex space-x-4 items-center justify-center md:justify-between">
        <div className="flex items-center justify-between gap-4">
          <MemoToggleTheme />
          <h2 className="md:text-2xl text-md font-bold">Welcome back, {user?.name?.split(' ')[0]}</h2>
        </div>
        <div>
          <p className="text-muted-foreground text-xs md:text-sm">
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