# 📊 Admin Features - Visual Guide & File Structure

## 🗂️ Project File Structure

```
mini-bank-web-app/
│
├── prisma/
│   └── schema.prisma                    ✏️ MODIFIED
│       ├── Added: AdminActionLog model
│       ├── Enhanced: User (supervisorId, status)
│       └── Relationships: supervisor/subordinates
│
├── lib/
│   ├── permission.ts                    ✏️ MODIFIED
│   │   ├── ADMIN_ACTIONS enum
│   │   ├── canPerformAdminAction()
│   │   └── Helper functions
│   │
│   ├── services/
│   │   ├── accountService.ts            ✏️ MODIFIED
│   │   │   ├── suspend()
│   │   │   ├── resume()
│   │   │   ├── createBalance()
│   │   │   └── listAll()
│   │   │
│   │   └── transactionService.ts        ✏️ MODIFIED
│   │       ├── getAccountHistory()
│   │       ├── getUserTransactionHistory()
│   │       ├── getAllTransactions()
│   │       └── getUserTransactionStats()
│   │
│   └── controllers/
│       ├── adminAccountController.ts    🆕 NEW
│       │   ├── suspendAccount()
│       │   ├── resumeAccount()
│       │   └── createBalance()
│       │
│       └── transactionHistoryController.ts 🆕 NEW
│           ├── getHistory()
│           └── getStats()
│
├── app/api/
│   ├── admin/accounts/
│   │   ├── suspend/route.ts             🆕 NEW
│   │   ├── resume/route.ts              🆕 NEW
│   │   └── create-balance/route.ts      🆕 NEW
│   │
│   └── transactions/
│       ├── history/route.ts             🆕 NEW
│       └── stats/route.ts               🆕 NEW
│
├── components/admins/
│   ├── account-suspend-resume-dialog.tsx    🆕 NEW
│   ├── create-balance-dialog.tsx            🆕 NEW
│   ├── transaction-history-viewer.tsx       🆕 NEW
│   └── admin-dashboard-example.tsx          🆕 NEW
│
├── ADMIN_FEATURES.md                    🆕 NEW
├── QUICK_START.md                       🆕 NEW
├── ARCHITECTURE.md                      🆕 NEW
├── IMPLEMENTATION_SUMMARY.md            🆕 NEW
└── README_ADMIN_FEATURES.md             🆕 NEW

Legend:
🆕 = New file created
✏️ = Existing file modified
```

---

## 🔀 API Endpoint Map

```
┌─────────────────────────────────────────────┐
│         ADMIN ACCOUNT ENDPOINTS             │
└─────────────────────────────────────────────┘

POST /api/admin/accounts/suspend
├── Auth: admin, superadmin
├── Body: { accountId, reason }
└── Response: { message, accountId, newStatus }

POST /api/admin/accounts/resume  
├── Auth: admin, superadmin
├── Body: { accountId, reason }
└── Response: { message, accountId, newStatus }

POST /api/admin/accounts/create-balance
├── Auth: admin, superadmin
├── Body: { accountId, balance, reason }
└── Response: { message, newBalance, difference }

┌─────────────────────────────────────────────┐
│     TRANSACTION HISTORY ENDPOINTS           │
└─────────────────────────────────────────────┘

GET /api/transactions/history
├── Auth: user, admin, superadmin
├── Query: ?accountId=...&limit=50&skip=0
│         ?startDate=...&endDate=...&type=...
└── Response: { transactions[], total, page, pages }

GET /api/transactions/stats
├── Auth: user, admin, superadmin
├── Query: ?userId=...
└── Response: { totalCount, totalAmount, byType[] }
```

---

## 🎨 Component Integration Diagram

```
┌─────────────────────────────────────────────────┐
│       Admin Dashboard Example Page              │
├─────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────┐   │
│ │  Tabs: [Accounts] [Transactions]         │   │
│ └──────────────────────────────────────────┘   │
│                                                 │
│ ┌──────────────────────────────────────────┐   │
│ │  AccountsTab                             │   │
│ ├──────────────────────────────────────────┤   │
│ │ ┌─────────────────────────────────────┐ │   │
│ │ │ Account Table                       │ │   │
│ │ ├─────────────────────────────────────┤ │   │
│ │ │ Account | User | Balance | Actions │ │   │
│ │ ├─────────────────────────────────────┤ │   │
│ │ │ ACC-1  |  Bob | $1,000  | [Actions]│ │   │
│ │ │        │      │         │ Suspend  │ │   │
│ │ │        │      │         │ Set Bal  │ │   │
│ │ │        │      │         │ History  │ │   │
│ │ └─────────────────────────────────────┘ │   │
│ └──────────────────────────────────────────┘   │
│ ┌──────────────────────────────────────────┐   │
│ │  [Dialog Modals]                         │   │
│ ├──────────────────────────────────────────┤   │
│ │ • AccountSuspendResumeDialog             │   │
│ │ • CreateBalanceDialog                    │   │
│ └──────────────────────────────────────────┘   │
│                                                 │
│ ┌──────────────────────────────────────────┐   │
│ │  TransactionsTab                         │   │
│ ├──────────────────────────────────────────┤   │
│ │ ┌─────────────────────────────────────┐ │   │
│ │ │ TransactionHistoryViewer            │ │   │
│ │ ├─────────────────────────────────────┤ │   │
│ │ │ [Filters: Type, Date Range, Status] │ │   │
│ │ ├─────────────────────────────────────┤ │   │
│ │ │ Transaction Table with Pagination   │ │   │
│ │ └─────────────────────────────────────┘ │   │
│ └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

---

## 🔄 User Workflows

### Workflow 1: Suspend Account

```
┌──────────────┐
│  Admin User  │
└──────┬───────┘
       │ 1. Login to admin panel
       ↓
┌──────────────────────────────────┐
│ Admin Dashboard (Accounts Tab)   │
├──────────────────────────────────┤
│ [Account Table]                  │
│ Find account → Click "Suspend"   │
└──────┬───────────────────────────┘
       │ 2. Dialog Opens
       ↓
┌──────────────────────────────────┐
│ Suspend Account Dialog           │
├──────────────────────────────────┤
│ Account: ACC-123                 │
│ Reason: [Text Input]             │
│ [Suspend] [Cancel]               │
└──────┬───────────────────────────┘
       │ 3. Fill reason & submit
       ↓
┌──────────────────────────────────┐
│ POST /api/admin/accounts/suspend │
├──────────────────────────────────┤
│ Validate → Execute → Log         │
└──────┬───────────────────────────┘
       │ 4. Success
       ↓
┌──────────────────────────────────┐
│ Success Message Shown            │
│ Account Table Refreshed          │
│ Account Status: "suspended"      │
└──────────────────────────────────┘
```

### Workflow 2: Set Account Balance

```
┌──────────────┐
│  Admin User  │
└──────┬───────┘
       │ 1. Find account in table
       │    Click "Set Balance"
       ↓
┌──────────────────────────────────┐
│ Create Balance Dialog            │
├──────────────────────────────────┤
│ Account: ACC-456                 │
│ Current: $1,000                  │
│ New Balance: [Input] (e.g., 5000)│
│ Change: +$4,000                  │
│ Reason: [Text Input]             │
│ [Create] [Cancel]                │
└──────┬───────────────────────────┘
       │ 2. Enter data & submit
       ↓
┌──────────────────────────────────┐
│ POST /api/admin/accounts/        │
│ create-balance                   │
├──────────────────────────────────┤
│ Validate → Execute → Log         │
│ Creates Transaction Record       │
└──────┬───────────────────────────┘
       │ 3. Success
       ↓
┌──────────────────────────────────┐
│ Success Message               │
│ Updated Balance: $5,000       │
│ Table Refreshed               │
└──────────────────────────────────┘
```

### Workflow 3: View Transaction History

```
┌──────────────┐
│  Admin User  │
└──────┬───────┘
       │ 1. Find account
       │    Click "History"
       ↓
┌──────────────────────────────────┐
│ Transaction History Viewer       │
├──────────────────────────────────┤
│ [Filters]                        │
│ Type: [All v]                    │
│ Date From: [___]                 │
│ Date To: [___]                   │
│ [Clear Filters]                  │
├──────────────────────────────────┤
│ [Transaction Table]              │
│ Date|Type|Amount|Balance|Desc    │
│ ... (paginated)                  │
├──────────────────────────────────┤
│ [Prev] [1][2][3] [Next]          │
└──────┬───────────────────────────┘
       │ 2. Apply filters as needed
       ↓
┌──────────────────────────────────┐
│ GET /api/transactions/history    │
├──────────────────────────────────┤
│ Query Validation → Filter & Sort │
│ → Paginate → Return Results      │
└──────┬───────────────────────────┘
       │ 3. Results displayed
       ↓
┌──────────────────────────────────┐
│ Transactions Shown               │
│ Can further filter & paginate    │
└──────────────────────────────────┘
```

---

## 📋 Permission Matrix

```
                Suspend  Resume  Set Bal  View Hist  Manage Admin
┌──────────────┬─────────┬─────────┬─────────┬──────────┬──────────┐
│ User Role    │ Account │ Account │ Account │ Any User │ Admins   │
├──────────────┼─────────┼─────────┼─────────┼──────────┼──────────┤
│ User         │ ✗ No    │ ✗ No    │ ✗ No    │ Own Only │ ✗ No     │
│ Admin        │ ✓ Yes   │ ✓ Yes   │ ✓ Yes   │ ✓ Yes    │ ✗ No     │
│ SuperAdmin   │ ✓ Yes   │ ✓ Yes   │ ✓ Yes   │ ✓ Yes    │ ✓ Yes    │
└──────────────┴─────────┴─────────┴─────────┴──────────┴──────────┘
```

---

## 🔐 Authorization Flow

```
Request → Check Auth → Check Role → Execute → Audit

Step 1: Authentication
┌──────────────────────────────────┐
│ Check JWT Token in Cookies       │
├──────────────────────────────────┤
│ If missing → 401 Unauthorized    │
│ If invalid → 401 Unauthorized    │
│ If expired → 401 Unauthorized    │
└──────────────────────────────────┘
          ↓ ✓ Token Valid
        
Step 2: Authorization
┌──────────────────────────────────┐
│ Extract Role from Token          │
├──────────────────────────────────┤
│ If role not in allowed list:     │
│ → 403 Forbidden                  │
└──────────────────────────────────┘
          ↓ ✓ Role Allowed
        
Step 3: Validation
┌──────────────────────────────────┐
│ Validate Request Body (Zod)      │
├──────────────────────────────────┤
│ If invalid → 400 Bad Request     │
│ Type check, range check, etc.    │
└──────────────────────────────────┘
          ↓ ✓ Validation Passed
        
Step 4: Execution
┌──────────────────────────────────┐
│ Execute Business Logic           │
│ (in transactional wrapper)       │
├──────────────────────────────────┤
│ If resource not found → 404      │
│ If conflict → 400 or 409         │
│ If error → 500                   │
└──────────────────────────────────┘
          ↓ ✓ Execution Successful
        
Step 5: Audit Logging
┌──────────────────────────────────┐
│ Create AdminActionLog Entry      │
│ Create AccountLog Entry          │
│ Create Transaction Record (if $) │
└──────────────────────────────────┘
          ↓
        
Step 6: Response
┌──────────────────────────────────┐
│ Return 200 Success with Data     │
└──────────────────────────────────┘
```

---

## 📊 Data Flow for Suspend Action

```
INPUT LAYER
┌─────────────────────────────────────┐
│ React Component (UI Dialog)          │
│ • accountId: string                 │
│ • reason: string (min 5 chars)      │
└────────────┬────────────────────────┘
             │ fetch() with JWT

TRANSPORT LAYER
┌─────────────────────────────────────┐
│ HTTP POST Request                   │
│ /api/admin/accounts/suspend         │
│ Headers: { Cookie: token=... }      │
└────────────┬────────────────────────┘
             │ authorize middleware

AUTHORIZATION LAYER
┌─────────────────────────────────────┐
│ Check JWT & Role                    │
│ Verify: admin || superadmin         │
└────────────┬────────────────────────┘
             │ pass session context

VALIDATION LAYER
┌─────────────────────────────────────┐
│ Zod Schema Validation               │
│ • accountId: string().min(1)        │
│ • reason: string().min(5)           │
└────────────┬────────────────────────┘
             │ parse & validate

CONTROLLER LAYER
┌─────────────────────────────────────┐
│ adminAccountController              │
│ • Get account from DB               │
│ • Check status (not already susp)   │
│ • Call service                      │
└────────────┬────────────────────────┘
             │ invoke business logic

SERVICE LAYER (TRANSACTIONAL)
┌─────────────────────────────────────┐
│ accountService.suspend()            │
│ prisma.$transaction(async (tx) => {│
│   1. Verify account exists          │
│   2. Create AccountLog              │
│   3. Create AdminActionLog          │
│   4. Update account status          │
│ })                                  │
│ (All or nothing atomic update)      │
└────────────┬────────────────────────┘
             │ database changes

DATA LAYER
┌─────────────────────────────────────┐
│ MongoDB Collections:                │
│ • accounts: { status: "suspended"}  │
│ • accountlogs: { action: "susp" }   │
│ • adminactionlogs: { new entry }    │
└────────────┬────────────────────────┘
             │ changes persisted

RESPONSE LAYER
┌─────────────────────────────────────┐
│ HTTP 200 Response                   │
│ {                                   │
│   message: "Account suspended",     │
│   accountId: "...",                 │
│   newStatus: "suspended",           │
│   suspendedBy: "admin@email.com",   │
│   timestamp: "2026-02-01T..."       │
│ }                                   │
└────────────┬────────────────────────┘
             │ response returned

UI LAYER
┌─────────────────────────────────────┐
│ React Component                     │
│ • Success message shown             │
│ • Dialog auto-closes                │
│ • Account list refreshed            │
│ • Account status updated            │
└─────────────────────────────────────┘
```

---

## 🎯 Testing Pyramid

```
                    ▲
                   ╱ ╲
                  ╱   ╲  E2E Tests
                 ╱     ╲ (Full workflow)
                ╱───────╲
               ╱         ╲
              ╱ Integration╲ (API routes + DB)
             ╱      Tests   ╲
            ╱─────────────────╲
           ╱                   ╱
          ╱  Unit Tests       ╱
         ╱  (Services,       ╱
        ╱   Controllers)    ╱
       ╱─────────────────╱
      ╱     Foundation   ╱
     ╱________________╱

Test Coverage:
✓ Unit Tests
  - Service methods
  - Controller logic
  - Permission checks

✓ Integration Tests
  - API endpoints
  - Database operations
  - Authorization

✓ E2E Tests
  - Full admin workflows
  - UI component behavior
  - Error scenarios
```

---

**Version**: 1.0  
**Last Updated**: February 1, 2026  
**Status**: ✅ Complete
