# Admin Features - Quick Reference

## 🚀 Quick Start

### Access Admin Dashboard
```
URL: http://localhost:3000/admin-panel/accounts
Requirements: Must be logged in as admin or superadmin
```

### Core Features Available
1. **Account Management** - View, search, filter all accounts
2. **Account Control** - Suspend and resume accounts
3. **Balance Management** - Set or adjust account balances
4. **Transaction History** - View detailed transaction logs

---

## 📋 Feature Summary

| Feature | Component | Endpoint | Status |
|---------|-----------|----------|--------|
| List Accounts | AdminDashboard | GET /api/accounts | ✅ Complete |
| Search Accounts | AdminDashboard | Client-side | ✅ Complete |
| Filter by Status | AdminDashboard | Client-side | ✅ Complete |
| Suspend Account | AccountSuspendResumeDialog | POST /api/admin/accounts/suspend | ✅ Complete |
| Resume Account | AccountSuspendResumeDialog | POST /api/admin/accounts/resume | ✅ Complete |
| Set Balance | CreateBalanceDialog | POST /api/admin/accounts/create-balance | ✅ Complete |
| View Transactions | TransactionHistoryViewer | GET /api/transactions/history | ✅ Complete |
| Filter Transactions | TransactionHistoryViewer | Client-side + API params | ✅ Complete |

---

## 💻 Component Usage

### AdminDashboard
```tsx
import { AdminDashboard } from '@/components/admins/admin-dashboard-example';

export default function AdminAccountsPage() {
  return <AdminDashboard />;
}
```

### AccountSuspendResumeDialog (Direct Usage)
```tsx
<AccountSuspendResumeDialog
  account={selectedAccount}
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  action="suspend" // or "resume"
  onSuccess={() => fetchAccounts()}
/>
```

### CreateBalanceDialog (Direct Usage)
```tsx
<CreateBalanceDialog
  account={selectedAccount}
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  onSuccess={() => fetchAccounts()}
/>
```

### TransactionHistoryViewer (Direct Usage)
```tsx
<TransactionHistoryViewer
  accountId="account-123"
  // or userId="user-456"
/>
```

---

## 🔄 Data Flow

```
User navigates to /admin-panel/accounts
  ↓
AdminDashboard component loads
  ↓
fetchAccounts() executes
  ↓
GET /api/accounts returns accounts[]
  ↓
Accounts render in table with search/filter
  ↓
User clicks action (Suspend/Resume/Set Balance/History)
  ↓
Dialog opens with selected account data
  ↓
User fills form and submits
  ↓
Dialog makes API call (POST request)
  ↓
Backend processes request and returns success/error
  ↓
Dialog shows result and calls onSuccess callback
  ↓
handleDialogSuccess() triggers fetchAccounts()
  ↓
Table updates with latest data
```

---

## 🎯 User Actions & Workflows

### Action: Suspend an Account
1. Go to `/admin-panel/accounts`
2. Find account in table
3. Click "Suspend" button
4. Enter reason (min 5 characters)
5. Click "Suspend Account"
6. Wait for success message
7. Dialog closes, account status updates

### Action: Resume an Account
1. Find suspended account in table
2. Click "Resume" button
3. Enter reason for resuming
4. Click "Resume Account"
5. Wait for success
6. Account returns to active status

### Action: Set Account Balance
1. Click "Set Bal" button on any account
2. Enter new balance amount
3. (Optional) See balance change indicator
4. Enter reason for balance change
5. Click "Create Balance"
6. Balance updates immediately

### Action: View Transaction History
1. Click "History" button on any account
2. TransactionHistoryViewer tab opens
3. (Optional) Apply filters:
   - Select transaction type
   - Enter date range
   - Click filter or clear filters
4. View transactions in paginated table
5. Navigate between pages

---

## 🔐 Authorization Rules

| Action | Required Role | Endpoint |
|--------|---------------|----------|
| View accounts | admin, superadmin | GET /api/accounts |
| Suspend account | admin, superadmin | POST /api/admin/accounts/suspend |
| Resume account | admin, superadmin | POST /api/admin/accounts/resume |
| Set balance | admin, superadmin | POST /api/admin/accounts/create-balance |
| View transactions | user, admin, superadmin | GET /api/transactions/history |

---

## 🧪 Testing Quick Commands

### Test Account Listing
```javascript
fetch('/api/accounts')
  .then(r => r.json())
  .then(accounts => console.log(`Found ${accounts.length} accounts`))
```

### Test Suspend Account
```javascript
fetch('/api/admin/accounts/suspend', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    accountId: 'ACCOUNT_ID_HERE',
    reason: 'Testing suspension'
  })
}).then(r => r.json()).then(console.log)
```

### Test Transaction History
```javascript
const params = new URLSearchParams();
params.append('accountId', 'ACCOUNT_ID_HERE');
params.append('limit', '10');

fetch(`/api/transactions/history?${params}`)
  .then(r => r.json())
  .then(data => console.log(`${data.total} total transactions`))
```

---

## 📊 State Management

### AdminDashboard State
```typescript
const [accounts, setAccounts] = useState<Account[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [searchTerm, setSearchTerm] = useState('');
const [filterStatus, setFilterStatus] = useState('all');
const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
const [resumeDialogOpen, setResumeDialogOpen] = useState(false);
const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);
const [historyAccountId, setHistoryAccountId] = useState('');
```

### Dialog State (Suspend/Resume)
```typescript
const [reason, setReason] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [success, setSuccess] = useState(false);
```

### Dialog State (Create Balance)
```typescript
const [balance, setBalance] = useState('');
const [reason, setReason] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [success, setSuccess] = useState(false);
```

### TransactionHistoryViewer State
```typescript
const [transactions, setTransactions] = useState<Transaction[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [page, setPage] = useState(1);
const [total, setTotal] = useState(0);
const [type, setType] = useState('');
const [startDate, setStartDate] = useState('');
const [endDate, setEndDate] = useState('');
```

---

## 🔍 API Request/Response Format

### GET /api/accounts
```
Request:
GET /api/accounts

Response (200 OK):
[
  {
    id: "acc-123",
    accountNumber: "ACC-001",
    userId: "user-456",
    accountType: "checking",
    balance: 1500.50,
    currency: "USD",
    status: "active",
    createdAt: "2024-01-15T10:30:00Z",
    user: {
      id: "user-456",
      name: "John Doe",
      email: "john@example.com",
      role: "user"
    }
  }
]
```

### POST /api/admin/accounts/suspend
```
Request:
{
  accountId: "acc-123",
  reason: "Account owner requested suspension"
}

Response (200 OK):
{
  success: true,
  message: "Account suspended successfully"
}
```

### POST /api/admin/accounts/create-balance
```
Request:
{
  accountId: "acc-123",
  balance: 2000.00,
  reason: "Monthly adjustment - interest payment"
}

Response (200 OK):
{
  success: true,
  message: "Balance created/updated successfully",
  account: { /* updated account object */ }
}
```

### GET /api/transactions/history
```
Request:
GET /api/transactions/history?accountId=acc-123&limit=50&skip=0

Response (200 OK):
{
  transactions: [
    {
      id: "tx-1",
      accountId: "acc-123",
      type: "deposit",
      amount: 100.00,
      currency: "USD",
      description: "Payroll deposit",
      status: "completed",
      timestamp: "2024-01-15T12:00:00Z",
      runningBalance: 1600.50
    }
  ],
  total: 45
}
```

---

## ⚠️ Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "Forbidden" (403) | User not admin | Login as admin/superadmin |
| "Account not found" | Invalid ID | Copy ID from table |
| "Reason too short" | < 5 characters | Enter reason with 5+ chars |
| "Invalid balance" | Negative number | Enter positive number |
| "No transactions" | Wrong date range | Clear filters, try all dates |
| "Failed to fetch" | Network error | Check internet, refresh page |

---

## 📈 Performance Notes

- **Account list**: Loads all accounts (no pagination yet)
- **Search**: Client-side filtering (instant)
- **Transactions**: Server-side pagination (50 per page default)
- **Date filtering**: UTC formatted with time bounds
- **Loading states**: Skeleton screens while fetching

---

## 🔗 Important File Locations

```
Frontend Components:
  - /components/admins/admin-dashboard-example.tsx
  - /components/admins/account-suspend-resume-dialog.tsx
  - /components/admins/create-balance-dialog.tsx
  - /components/admins/transaction-history-viewer.tsx

Pages:
  - /app/(protected)/admin-panel/accounts/page.tsx

API Routes:
  - /app/api/accounts/route.ts
  - /app/api/admin/accounts/suspend/route.ts
  - /app/api/admin/accounts/resume/route.ts
  - /app/api/admin/accounts/create-balance/route.ts
  - /app/api/transactions/history/route.ts

Documentation:
  - ADMIN_REFACTORING_COMPLETE.md
  - ADMIN_TROUBLESHOOTING.md
  - ADMIN_FEATURES.md
```

---

## ✨ What's New (Refactored)

✅ **Real-time search** - Find accounts instantly
✅ **Status filtering** - Filter by active/suspended/closed
✅ **Loading states** - Beautiful skeleton screens
✅ **Error handling** - User-friendly error messages
✅ **Data refresh** - Auto-refresh after actions
✅ **Pagination** - Smart pagination with reset logic
✅ **Date formatting** - Proper UTC date handling
✅ **Color coding** - Visual indicators for amounts/status
✅ **Responsive design** - Works on all screen sizes
✅ **Type safety** - Full TypeScript support

---

## 🎓 Learning Resources

For deeper understanding, see:
- `ADMIN_REFACTORING_COMPLETE.md` - Complete implementation guide
- `ADMIN_TROUBLESHOOTING.md` - Debug & troubleshoot issues
- `ADMIN_FEATURES.md` - Original feature documentation
- `ARCHITECTURE.md` - System architecture overview

---

**Last Updated**: 2024
**Status**: ✅ Production Ready
**Build Status**: ✅ Passing
