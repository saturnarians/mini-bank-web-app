1. The Root Directory Structure

/root
├── app/                  # Route Groups, Layouts, and Pages
├── components/           # UI and Feature-specific components
├── lib/                  # Database clients, Shared Utils, Auth logic
├── hooks/                # Custom React hooks (e.g., usePermissions)
├── actions/              # Server Actions (Money transfers, Role updates)
├── types/                # TypeScript interfaces/definitions
└── constants/            # Role definitions, Interest rates, API config

2. Detailed Breakdown: /app (Routes)
Using Route Groups () allows you to separate layouts (e.g., the User gets a simple sidebar; the Admin gets a complex data dashboard).

app/
├── (auth)/               # Public: Login, Register, Forgot Password
├── (dashboard)/          # Private: Customer Features
│   ├── layout.tsx        # Standard User Sidebar/Nav
│   ├── accounts/         # /accounts
│   ├── transactions/     # /transactions
│   └── page.tsx          # Main Dashboard Overview
└── (admin-panel)/        # Private: Staff & Owner Features
    ├── layout.tsx        # Admin Sidebar (with "Admin Mode" styling)
    ├── users/            # User management for both Admin/Superadmin
    │   └── [id]/         # Detailed view of a customer
    ├── logs/             # Audit logs (Superadmin focus)
    └── page.tsx          # Admin Overview (Stats, Support queue)

3. Detailed Breakdown: /components (UI)

Organizing by Domain is the key here. It prevents an Admin-specific button from accidentally appearing on the User's dashboard.

components/
├── ui/                   # Atomic: Button, Input, Modal, Badge (Shadcn)
├── shared/               # Used everywhere: Logo, Avatar, Footer
├── charts/               # Recharts wrappers for data visualization
├── user/                 # Logic for Customers
│   ├── balance-card.tsx
│   └── transfer-form.tsx
└── admin/                # Shared logic for Admin & Superadmin
    ├── actions/          # The "Add Funds" & "Add History" forms
    ├── permissions/      # Components that hide/show based on rank
    └── user-table.tsx    # List of bank customers


4. Logic & Security: /lib and /actions
In a banking app, you never trust the client-side. All logic regarding "Admin cannot override Superadmin" happens here.

lib/permissions.ts: Contains logic like checkHierarchy(actorRole, targetRole).

actions/funds.ts: Server Actions that update the DB. This is where the code checks: "Wait, an Admin is trying to add funds to a Superadmin's account? REJECTED."

Component,Folder Location,Who uses it?,Visibility Logic
Add Funds Form,components/admin/actions/,Admin & Superadmin,Visible to both.
Delete User Button,components/admin/actions/,Superadmin Only,Hidden from Admin via if (role !== 'SUPER').
Balance View,components/user/,Customer,Only shows personal data.
Audit Log Table,components/admin/,Admin & Superadmin,Admin sees own logs; Superadmin sees ALL.