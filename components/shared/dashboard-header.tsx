'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { canAccessPage } from '@/lib/permission';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Accounts', href: '/accounts' },
  { name: 'Transactions', href: '/transactions' },
  { name: 'Admin Panel', href: '/admin' }, // Sensitive link
];

export function DashboardHeader() {
  const pathname = usePathname();
  const { user } = useAppSelector(state => state.auth);

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


/*
2. Protecting Specific Actions (Buttons)
Sometimes you are on a page that everyone can see (like an Account Detail page), but only an Admin should see the "Delete" or "Suspend" button.

TypeScript

export function AccountActions({ accountId }: { accountId: string }) {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="flex gap-2">
      <button className="btn-secondary">Download Statement</button>

      {/* 2. Conditional rendering for Admin-only buttons 
      {user?.role === 'admin' && (
        <button 
          onClick={() => handleSuspend(accountId)} 
          className="bg-red-500 text-white p-2 rounded"
        >
          Suspend Account
        </button>
      )}
    </div>
  );
}
3. Why this "Double-Check" is Important
You might wonder: "If I already protected the URL in middleware, why do I need this?"

Visual Polish: It looks unprofessional to show an "Admin" tab to a regular customer.

Security Context: Even if they can't get to /admin, they might still be on /accounts/123 and try to click a "Delete" button. If the button is hidden, they can't even attempt the unauthorized action.

*/