# Admin Features Implementation Guide

## Overview

This document describes the implementation of admin and super-admin features for the mini-bank web application, including account suspension/resumption, balance creation, transaction history, and admin hierarchy.

---

## 1. Database Schema Updates

### New Models

#### AdminActionLog Model
Tracks all administrative actions for audit purposes:
- **adminId**: User ID of the admin who performed the action
- **action**: Type of action (suspend_account, resume_account, create_balance, etc.)
- **targetType**: What was affected (account, user)
- **targetId**: ID of the affected resource
- **reason**: Why the action was taken
- **metadata**: Additional context stored as JSON
- **createdAt**: Timestamp of the action

#### Enhanced User Model
Added fields for admin hierarchy and status:
- **supervisorId**: Reference to the supervising admin (for admin hierarchy)
- **status**: User status (active, suspended)
- **supervisedBy**: Relationship to supervisor
- **subordinates**: Relationship to supervised admins
- **adminLogs**: Actions performed by this admin

---

## 2. API Endpoints

### Account Management

#### Suspend Account
```
POST /api/admin/accounts/suspend
Authorization: admin, superadmin
Content-Type: application/json

{
  "accountId": "string",
  "reason": "string (min 5 chars)"
}

Response (200):
{
  "message": "Account suspended successfully",
  "accountId": "string",
  "newStatus": "suspended",
  "suspendedBy": "admin@email.com",
  "timestamp": "ISO-8601"
}
```

#### Resume Account
```
POST /api/admin/accounts/resume
Authorization: admin, superadmin
Content-Type: application/json

{
  "accountId": "string",
  "reason": "string (min 5 chars)"
}

Response (200):
{
  "message": "Account resumed successfully",
  "accountId": "string",
  "newStatus": "active",
  "resumedBy": "admin@email.com",
  "timestamp": "ISO-8601"
}
```

#### Create/Set Account Balance
```
POST /api/admin/accounts/create-balance
Authorization: admin, superadmin
Content-Type: application/json

{
  "accountId": "string",
  "balance": "number",
  "reason": "string (min 5 chars)"
}

Response (200):
{
  "message": "Balance created/updated successfully",
  "accountId": "string",
  "previousBalance": "number",
  "newBalance": "number",
  "difference": "number",
  "createdBy": "admin@email.com",
  "timestamp": "ISO-8601"
}
```

### Transaction History

#### Get Transaction History
```
GET /api/transactions/history?accountId=X&startDate=Y&endDate=Z&type=deposit&limit=50&skip=0
Authorization: user, admin, superadmin

Query Parameters:
- accountId (optional): Filter by specific account
- userId (optional): Filter by user (admin only)
- startDate (optional): ISO-8601 datetime
- endDate (optional): ISO-8601 datetime
- type (optional): deposit, withdrawal, transfer, adjustment
- status (optional): completed, pending, failed
- limit (default: 50, max: 100)
- skip (default: 0, for pagination)

Response (200):
{
  "transactions": [
    {
      "id": "string",
      "accountId": "string",
      "type": "deposit|withdrawal|transfer|adjustment",
      "amount": "number",
      "runningBalance": "number",
      "currency": "string",
      "status": "completed|pending|failed",
      "description": "string",
      "timestamp": "ISO-8601",
      "reference": "string"
    }
  ],
  "total": "number",
  "page": "number",
  "pages": "number"
}
```

#### Get Transaction Statistics
```
GET /api/transactions/stats?userId=X
Authorization: user, admin, superadmin

Query Parameters:
- userId (optional): For admins to view specific user stats

Response (200):
{
  "userId": "string",
  "totalCount": "number",
  "totalAmount": "number",
  "byType": [
    {
      "type": "string",
      "_count": "number",
      "_sum": { "amount": "number" }
    }
  ]
}
```

---

## 3. Role & Permission System

### Updated Permission System

Located in `lib/permission.ts`:

```typescript
export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  superadmin: ['*'], // Full access
  admin: [
    '/dashboard', 
    '/accounts', 
    '/admin', 
    '/admin-panel', 
    '/profile', 
    '/transactions',
    '/api/admin/accounts/suspend',
    '/api/admin/accounts/resume',
    '/api/admin/accounts/create-balance',
    '/api/admin/transactions/history',
  ],
  user: ['/dashboard', '/accounts', '/profile', '/transactions'],
};
```

### Admin Actions

Granular admin actions defined in `ADMIN_ACTIONS`:
- `SUSPEND_ACCOUNT`: Suspend user account
- `RESUME_ACCOUNT`: Resume user account
- `CREATE_BALANCE`: Create/set account balance
- `VIEW_TRANSACTION_HISTORY`: View transaction history
- `CREATE_ADMIN`: Create new admin (superadmin only)
- `SUSPEND_ADMIN`: Suspend admin account (superadmin only)
- `RESUME_ADMIN`: Resume admin account (superadmin only)

### Admin Hierarchy

**Super Admin (superadmin role)**:
- Full system access (all permissions)
- Can create, suspend, and resume other admins
- Can view all users, accounts, and transactions
- Can audit all admin actions

**Admin (admin role)**:
- Can suspend/resume user accounts
- Can create/set account balances
- Can view transaction history for all users
- Can perform basic admin operations
- Cannot manage other admins (superadmin-only privilege)
- Supervised by a super admin (via `supervisorId` field)

**User (user role)**:
- Can only view own accounts and transactions
- Cannot perform admin operations

---

## 4. Service Layer

### AccountService Enhancements

#### suspend()
```typescript
async suspend(
  accountId: string,
  reason: string,
  adminId: string
): Promise<Account>
```
Suspends an account and creates:
1. AccountLog entry for audit trail
2. AdminActionLog entry for admin activity tracking

#### resume()
```typescript
async resume(
  accountId: string,
  reason: string,
  adminId: string
): Promise<Account>
```
Resumes a suspended account with full audit trail.

#### createBalance()
```typescript
async createBalance(
  accountId: string,
  balance: number,
  reason: string,
  adminId: string
): Promise<Account>
```
Creates or sets account balance, creates:
1. Transaction record for ledger trail
2. AdminActionLog for activity tracking

#### listAll()
```typescript
async listAll(options?: {
  skip?: number;
  take?: number;
  status?: string;
}): Promise<Account[]>
```
Lists all accounts (admin view).

### TransactionService Enhancements

#### getAccountHistory()
Get transaction history for a specific account with filtering and pagination.

#### getUserTransactionHistory()
Get all transactions across a user's accounts.

#### getAllTransactions()
Get all system transactions (admin view).

#### getUserTransactionStats()
Get aggregated statistics about a user's transactions.

---

## 5. UI Components

### AccountSuspendResumeDialog
Located in `components/admins/account-suspend-resume-dialog.tsx`

Features:
- Account details display
- Reason textarea (min 5 characters required)
- Real-time validation
- Error/success feedback
- Loading states

Usage:
```tsx
const [suspendOpen, setSuspendOpen] = useState(false);
const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

<AccountSuspendResumeDialog
  account={selectedAccount}
  isOpen={suspendOpen}
  onOpenChange={setSuspendOpen}
  action="suspend"
  onSuccess={() => {
    // Refresh account data
  }}
/>
```

### CreateBalanceDialog
Located in `components/admins/create-balance-dialog.tsx`

Features:
- Input validation
- Visual balance change indicator (red/green)
- Reason requirement (min 5 chars)
- Transaction creation tracking

Usage:
```tsx
const [balanceOpen, setBalanceOpen] = useState(false);

<CreateBalanceDialog
  account={selectedAccount}
  isOpen={balanceOpen}
  onOpenChange={setBalanceOpen}
  onSuccess={() => {
    // Refresh account data
  }}
/>
```

### TransactionHistoryViewer
Located in `components/admins/transaction-history-viewer.tsx`

Features:
- Transaction table with pagination
- Date range filtering
- Transaction type filtering
- Clear filters button
- Responsive design
- Loading and error states

Usage:
```tsx
<TransactionHistoryViewer
  accountId={accountId}
  userId={userId}
/>
```

---

## 6. Authorization & Security

### Authorization Guard
All admin endpoints use the `authorize()` middleware:
```typescript
export const POST = authorize(["admin", "superadmin"], async (req, context) => {
  // Handler code
});
```

### Validation
- All inputs validated with Zod schemas
- Reason fields minimum 5 characters
- Balance must be non-negative number
- AccountId verified to exist before operations

### Audit Trail
- Every admin action logged to `AdminActionLog`
- Every account change logged to `AccountLog`
- Transaction created for balance adjustments
- Metadata includes admin ID, timestamp, and context

### Authorization Checks
- Users can only view their own transactions
- Admins can view any user's transactions
- SuperAdmins have unrestricted access
- All endpoints verify session before proceeding

---

## 7. Data Flow Examples

### Suspend Account Flow
1. Admin calls `POST /api/admin/accounts/suspend`
2. Request validated with Zod schema
3. Account existence verified
4. `accountService.suspend()` called (transaction-wrapped):
   - AccountLog created
   - AdminActionLog created
   - Account status updated to "suspended"
5. Response sent with confirmation

### Create Balance Flow
1. Admin calls `POST /api/admin/accounts/create-balance`
2. Inputs validated
3. Account verified
4. `accountService.createBalance()` called:
   - Account balance updated
   - Transaction record created (adjustment type)
   - AdminActionLog created with metadata
5. Response includes previousBalance, newBalance, and difference

### Get Transaction History Flow
1. User/Admin calls `GET /api/transactions/history?accountId=X`
2. Authorization checked (users see own, admins see all)
3. Query parameters validated
4. `transactionService.getAccountHistory()` called with filters
5. Results paginated and returned with total count

---

## 8. Testing Examples

### Test Suspending an Account
```bash
curl -X POST http://localhost:3000/api/admin/accounts/suspend \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<admin_jwt>" \
  -d '{
    "accountId": "507f1f77bcf86cd799439011",
    "reason": "Account holder requested suspension due to security concerns"
  }'
```

### Test Creating Balance
```bash
curl -X POST http://localhost:3000/api/admin/accounts/create-balance \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<admin_jwt>" \
  -d '{
    "accountId": "507f1f77bcf86cd799439011",
    "balance": 5000,
    "reason": "Initial account setup for new customer verification"
  }'
```

### Test Getting Transaction History
```bash
curl -X GET "http://localhost:3000/api/transactions/history?accountId=507f1f77bcf86cd799439011&limit=20&skip=0" \
  -H "Cookie: token=<jwt>"
```

---

## 9. Migration Notes

### Database Migration Required
Run Prisma migration to add new fields:
```bash
npx prisma migrate dev --name add_admin_features
```

### Deployment Checklist
- [ ] Run database migrations
- [ ] Deploy updated schema
- [ ] Deploy service layer changes
- [ ] Deploy API routes
- [ ] Deploy UI components
- [ ] Test admin endpoints with test accounts
- [ ] Verify audit logs are being created
- [ ] Monitor for any authorization issues

---

## 10. Future Enhancements

1. **Admin Management API**: Create/list/update/delete admins
2. **Approval Workflows**: Multi-level approval for sensitive actions
3. **Activity Dashboard**: Real-time admin action monitoring
4. **Export Reports**: Export transaction history and audit logs
5. **Bulk Operations**: Suspend multiple accounts at once
6. **Webhooks**: Notify external systems of admin actions
7. **Rate Limiting**: Prevent abuse of admin endpoints
8. **Two-Factor Authentication**: Extra security for superadmin actions

---

## Summary

The implementation provides:
- ✅ Account suspension/resumption with audit trail
- ✅ Balance creation with transaction records
- ✅ Comprehensive transaction history with filtering
- ✅ Super admin hierarchy over admins
- ✅ Admin hierarchy over users
- ✅ Complete audit logging
- ✅ Secure authorization checks
- ✅ User-friendly React components
- ✅ Pagination and filtering support
- ✅ Error handling and validation
