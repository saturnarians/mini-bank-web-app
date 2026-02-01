# Admin Features Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Database Migration
```bash
# In your project root
npx prisma migrate dev --name add_admin_features
npx prisma generate
```

### Step 2: Copy Files
All new files are already created in the project:
- API routes: `app/api/admin/accounts/*` and `app/api/transactions/*`
- Controllers: `lib/controllers/adminAccountController.ts`, `lib/controllers/transactionHistoryController.ts`
- Components: `components/admins/*`
- Updated services: `lib/services/accountService.ts`, `lib/services/transactionService.ts`

### Step 3: Add Admin Panel Page
Create `app/(protected)/admin-panel/management/page.tsx`:

```tsx
'use client';

import { AdminDashboard } from '@/components/admins/admin-dashboard-example';

export default function AdminManagementPage() {
  return <AdminDashboard />;
}
```

### Step 4: Update Navigation
Add to your admin menu in `components/admins/admin-sidebar.tsx`:

```tsx
<NavLink href="/admin-panel/management">
  Account Management
</NavLink>
```

### Step 5: Test
```bash
# Start development server
npm run dev

# Navigate to /admin-panel/management
# Login with admin account
# Try suspending/resuming accounts
```

---

## 🎯 Common Tasks

### Display Account Suspend Button
```tsx
import { Button } from '@/components/ui/button';
import { AccountSuspendResumeDialog } from '@/components/admins/account-suspend-resume-dialog';

export function AccountCard({ account }: { account: Account }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setDialogOpen(true)}
        disabled={account.status === 'suspended'}
      >
        {account.status === 'suspended' ? 'Suspended' : 'Suspend'}
      </Button>

      <AccountSuspendResumeDialog
        account={account}
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        action="suspend"
        onSuccess={() => refetchAccount()}
      />
    </>
  );
}
```

### Show Transaction History
```tsx
import { TransactionHistoryViewer } from '@/components/admins/transaction-history-viewer';

export function AccountDetailsPage({ accountId }: { accountId: string }) {
  return (
    <div>
      <h2>Account Details</h2>
      {/* ... account info ... */}
      
      <h3>Transaction History</h3>
      <TransactionHistoryViewer accountId={accountId} />
    </div>
  );
}
```

### Set Account Balance
```tsx
import { CreateBalanceDialog } from '@/components/admins/create-balance-dialog';

function AccountRow({ account }: { account: Account }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setDialogOpen(true)}>Set Balance</Button>
      
      <CreateBalanceDialog
        account={account}
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => refetchAccounts()}
      />
    </>
  );
}
```

### Get User Transaction Stats
```tsx
import { useEffect, useState } from 'react';

export function UserStats({ userId }: { userId: string }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`/api/transactions/stats?userId=${userId}`)
      .then(r => r.json())
      .then(setStats);
  }, [userId]);

  if (!stats) return <div>Loading...</div>;

  return (
    <div>
      <p>Total Transactions: {stats.totalCount}</p>
      <p>Total Amount: ${stats.totalAmount.toFixed(2)}</p>
    </div>
  );
}
```

---

## 📊 API Quick Reference

### Suspend Account
```bash
POST /api/admin/accounts/suspend
Content-Type: application/json

{
  "accountId": "...",
  "reason": "Account holder requested"
}
```

### Resume Account
```bash
POST /api/admin/accounts/resume
Content-Type: application/json

{
  "accountId": "...",
  "reason": "Issue resolved"
}
```

### Set Balance
```bash
POST /api/admin/accounts/create-balance
Content-Type: application/json

{
  "accountId": "...",
  "balance": 5000,
  "reason": "Initial setup"
}
```

### Get Transaction History
```bash
GET /api/transactions/history?accountId=...&limit=50&skip=0
```

### Get Statistics
```bash
GET /api/transactions/stats?userId=...
```

---

## 🔐 Authorization

All admin endpoints automatically check for:
- Valid JWT token in cookies
- User role is `admin` or `superadmin`
- Returns 401 if not authenticated
- Returns 403 if insufficient permissions

**No manual auth checks needed** - the `authorize()` middleware handles it!

---

## ⚙️ Configuration

### Change Reason Minimum Length
In `lib/controllers/adminAccountController.ts`:
```typescript
const suspendAccountSchema = z.object({
  reason: z.string().min(10), // Changed from 5 to 10
});
```

### Change Transaction History Limit
In `lib/controllers/transactionHistoryController.ts`:
```typescript
limit: z.number().int().min(1).max(200).optional().default(50), // Changed max to 200
```

### Change Role Permissions
In `lib/permission.ts`:
```typescript
export const ROLE_PERMISSIONS = {
  superadmin: ['*'],
  admin: [
    // Add new permissions here
    '/api/admin/reports',
  ],
  user: [/* ... */],
};
```

---

## 🐛 Troubleshooting

### "Unauthorized" Error
- Check user is logged in: `await getSessionFromCookies()`
- Verify user role is `admin` or `superadmin`
- Check JWT token is valid and not expired

### Account Not Found
- Verify accountId is correct (MongoDB ObjectId format)
- Check account exists in database
- Account may have been deleted

### Balance Appears Unchanged
- Check browser DevTools Network tab for errors
- Verify response status is 200
- Refresh page after operation

### Dialog Not Opening
- Ensure account is not null before rendering dialog
- Check state management (isOpen, onOpenChange)
- Verify Account type matches interface

---

## 🧪 Integration Tests

### Test Suspend Flow
```typescript
describe('Account Suspension', () => {
  it('should suspend account', async () => {
    const res = await fetch('/api/admin/accounts/suspend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accountId: testAccount.id,
        reason: 'Test suspension',
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.newStatus).toBe('suspended');
  });
});
```

### Test Authorization
```typescript
it('should reject non-admin users', async () => {
  const res = await fetch('/api/admin/accounts/suspend', {
    method: 'POST',
    // Note: No valid admin JWT in cookies
    body: JSON.stringify({ accountId: '...', reason: '...' }),
  });

  expect(res.status).toBe(403);
});
```

---

## 📈 Performance Considerations

### Database Indexes
All new queries use indexed fields:
- `Account.userId` - indexed for user lookups
- `Transaction.accountId` - indexed for filtering
- `Transaction.timestamp` - indexed for date filtering
- `AdminActionLog.adminId` - indexed for admin activity
- `AdminActionLog.createdAt` - indexed for sorting

### Pagination
Always use pagination for transaction history:
```bash
GET /api/transactions/history?limit=50&skip=0
```

Don't fetch all transactions at once!

### Caching
Consider caching user stats:
```tsx
const stats = useMemo(() => getUserStats(userId), [userId]);
```

---

## 🎓 Learning Resources

- **API Details**: See `ADMIN_FEATURES.md`
- **Database Schema**: See `prisma/schema.prisma`
- **Complete Example**: See `components/admins/admin-dashboard-example.tsx`
- **Type Definitions**: See `lib/types.ts`
- **Permission System**: See `lib/permission.ts`

---

## ✅ Checklist for Integration

- [ ] Run database migrations
- [ ] Create admin page component
- [ ] Add to navigation menu
- [ ] Test with admin account
- [ ] Verify audit logs in database
- [ ] Test error cases
- [ ] Update user documentation
- [ ] Monitor logs in production

---

## 🆘 Getting Help

If you encounter issues:

1. **Check logs**: Look for errors in console and server logs
2. **Verify auth**: Confirm user is logged in and has admin role
3. **Check database**: Use MongoDB compass to inspect collections
4. **Review code**: Reference implementation in controller files
5. **Test API directly**: Use curl/Postman to test endpoints

---

## 🔄 Common Workflows

### Daily Admin Tasks

**Task 1: Suspend Account**
1. Go to Account Management
2. Find account in table
3. Click "Suspend" button
4. Enter reason (min 5 chars)
5. Confirm

**Task 2: Set Initial Balance**
1. Create new user account
2. Go to Account Management
3. Find user's account
4. Click "Set Balance" button
5. Enter balance amount
6. Enter reason
7. Confirm

**Task 3: Review Transaction History**
1. Go to Account Management
2. Click "History" on account
3. View transaction table
4. Use filters for date range or type
5. Click pagination to navigate

---

**Version**: 1.0  
**Last Updated**: February 1, 2026  
**Status**: ✅ Ready to Use
