# Architecture Overview: Admin Features

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js/React)                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              React Components (admins/)              │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ • AccountSuspendResumeDialog                         │  │
│  │ • CreateBalanceDialog                               │  │
│  │ • TransactionHistoryViewer                          │  │
│  │ • AdminDashboard (example)                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              API Fetch Calls                         │  │
│  │  (Authenticated via JWT in cookies)                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                           ↓ HTTPS ↓
┌─────────────────────────────────────────────────────────────┐
│              Backend (Next.js API Routes)                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          Authorization Middleware                    │  │
│  │  (authorize(['admin', 'superadmin']))               │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Route Handlers                          │  │
│  │  • POST /api/admin/accounts/suspend                 │  │
│  │  • POST /api/admin/accounts/resume                  │  │
│  │  • POST /api/admin/accounts/create-balance          │  │
│  │  • GET /api/transactions/history                    │  │
│  │  • GET /api/transactions/stats                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Controllers                             │  │
│  │  • adminAccountController                           │  │
│  │  • transactionHistoryController                     │  │
│  │  (Input validation & error handling)                │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Services                                │  │
│  │  • accountService (business logic)                  │  │
│  │  • transactionService (business logic)              │  │
│  │  (Pure data access, no auth logic)                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Prisma ORM                              │  │
│  │  (Database transactions & atomic operations)        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                           ↓ MongoDB ↓
┌─────────────────────────────────────────────────────────────┐
│                      MongoDB Database                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Collections:                                               │
│  • users (with supervisorId, status)                       │
│  • accounts                                                 │
│  • accountlogs (audit trail)                               │
│  • adminactionlogs (admin activity)                        │
│  • transactions (immutable ledger)                         │
│  • balancesnapshots                                         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Request Flow Diagram

### Suspend Account Request

```
┌─────────────┐
│ Admin User  │
└──────┬──────┘
       │
       │ 1. Clicks "Suspend" button
       │    Account: { id: "...", status: "active" }
       │
       ↓
┌─────────────────────────────────────────────────┐
│ AccountSuspendResumeDialog Component            │
├─────────────────────────────────────────────────┤
│ • Shows account details                         │
│ • Validates reason (min 5 chars)                │
│ • Shows loading/error/success states            │
└──────┬──────────────────────────────────────────┘
       │
       │ 2. POST /api/admin/accounts/suspend
       │    Body: { accountId: "...", reason: "..." }
       │    Headers: { Cookie: "token=<JWT>" }
       │
       ↓
┌─────────────────────────────────────────────────┐
│ Route Handler (/api/admin/accounts/suspend)    │
├─────────────────────────────────────────────────┤
│ authorize(['admin', 'superadmin'])              │
│ • Verifies JWT token                           │
│ • Checks user role                             │
│ • Returns 401 if not authenticated             │
│ • Returns 403 if insufficient permissions      │
└──────┬──────────────────────────────────────────┘
       │
       │ 3. adminAccountController.suspendAccount()
       │    • Validates request body (Zod)
       │    • Gets account from DB
       │    • Checks account status
       │
       ↓
┌─────────────────────────────────────────────────┐
│ accountService.suspend()                        │
├─────────────────────────────────────────────────┤
│ prisma.$transaction(async (tx) => {             │
│   1. Verify account exists                      │
│   2. Create AccountLog entry                    │
│   3. Create AdminActionLog entry                │
│   4. Update account.status = "suspended"        │
│ })                                              │
│                                                 │
│ All-or-nothing: if any step fails,              │
│ entire transaction is rolled back               │
└──────┬──────────────────────────────────────────┘
       │
       │ 4. Database updates (atomic):
       │    • INSERT accountlog { ... }
       │    • INSERT adminactionlog { ... }
       │    • UPDATE account SET status="suspended"
       │
       ↓
┌─────────────────────────────────────────────────┐
│ MongoDB Database                                │
└──────┬──────────────────────────────────────────┘
       │
       │ 5. Success response returned
       │    Status: 200
       │    Body: { message: "Account suspended...",
       │            accountId: "...", ... }
       │
       ↓
┌─────────────────────────────────────────────────┐
│ Frontend Dialog Component                       │
├─────────────────────────────────────────────────┤
│ • Shows success message                         │
│ • Auto-closes after 2 seconds                   │
│ • Calls onSuccess callback                      │
│ • Refreshes account list                        │
└──────┬──────────────────────────────────────────┘
       │
       ↓
┌─────────────┐
│ Admin User  │
│ Sees updated│
│ account in  │
│ table with  │
│ "suspended" │
│ status      │
└─────────────┘
```

---

## Data Model Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                         User                                │
├─────────────────────────────────────────────────────────────┤
│ id              (PK)                                        │
│ email           (unique)                                   │
│ name                                                        │
│ password                                                    │
│ role            (user | admin | superadmin)                │
│ supervisorId    (FK: User.id) ← Admin hierarchy            │
│ status          (active | suspended)                       │
│ createdAt                                                   │
│ updatedAt                                                   │
├─────────────────────────────────────────────────────────────┤
│ ← hasMany: accounts                                         │
│ ← hasMany: transactions                                     │
│ ← hasMany: adminLogs (as performer)                         │
│ ← hasOne: supervisedBy (if admin)                          │
│ ← hasMany: subordinates (if superadmin)                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ↓              ↓              ↓
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Account    │ │ AdminActionLog│ │ Transaction  │
├──────────────┤ ├──────────────┤ ├──────────────┤
│ id (PK)      │ │ id (PK)      │ │ id (PK)      │
│ userId (FK)  │ │ adminId (FK) │ │ accountId(FK)│
│ accountNumber│ │ action       │ │ userId (FK)  │
│ accountType  │ │ targetType   │ │ type         │
│ balance      │ │ targetId     │ │ amount       │
│ status       │ │ reason       │ │ status       │
│ currency     │ │ metadata     │ │ description  │
│ createdAt    │ │ createdAt    │ │ timestamp    │
│ updatedAt    │ │              │ │ reference    │
│              │ │              │ │ runningBal   │
├──────────────┤ ├──────────────┤ ├──────────────┤
│ ← hasMany:   │ │              │ │              │
│   logs       │ │              │ │ Relations:   │
│ ← hasMany:   │ │              │ │ account      │
│   txns       │ │              │ │ user         │
└──────────────┘ └──────────────┘ └──────────────┘
        │                                │
        ↓                                ↓
┌──────────────┐                 ┌──────────────┐
│  AccountLog  │                 │ BalanceSnap- │
├──────────────┤                 │ shot         │
│ id (PK)      │                 ├──────────────┤
│ accountId(FK)│                 │ id (PK)      │
│ action       │                 │ accountId(FK)│
│ reason       │                 │ balance      │
│ performedBy  │                 │ date         │
│ createdAt    │                 │ createdAt    │
└──────────────┘                 └──────────────┘
```

---

## State & Flow Management

### Admin Action Flow
```
State Machine for Account:
                                    
         ┌──────────────┐          
         │   active     │◄─────────┐
         └──────┬───────┘          │
                │                  │
         Suspend action            │ Resume action
                │                  │
                ↓                  │
         ┌──────────────┐          │
         │  suspended   ├──────────┘
         └──────────────┘          
              ▲    ▲
              │    │
         Error│    │Rollback
              │    │
    ┌─────────┴────┴────┐
    │ Transaction Scope │
    │ (All or Nothing)  │
    └───────────────────┘
```

### Component State Management
```
AccountSuspendResumeDialog
├── reason: string (input)
├── loading: boolean (API call state)
├── error: string | null (error message)
├── success: boolean (success feedback)
└── Dialog lifecycle
    ├── On open: clear state
    ├── On submit: validate, call API
    ├── On success: show message, auto-close
    └── On error: show message, keep open
```

---

## Security Architecture

```
┌─────────────────────────────────────────────┐
│       Client-side Validation (UX)           │
│  • Reason minimum 5 characters              │
│  • Balance non-negative number              │
│  • Date format validation                   │
└──────────┬──────────────────────────────────┘
           │
           ↓
┌─────────────────────────────────────────────┐
│      Server-side Validation (Security)      │
│  • Zod schema validation                    │
│  • Type checking                            │
│  • Range validation                         │
│  • Required field checks                    │
└──────────┬──────────────────────────────────┘
           │
           ↓
┌─────────────────────────────────────────────┐
│     Authentication (Auth Guard)             │
│  • JWT token from cookies                   │
│  • Token expiration check                   │
│  • User session verification                │
│  → 401 if not authenticated                 │
└──────────┬──────────────────────────────────┘
           │
           ↓
┌─────────────────────────────────────────────┐
│     Authorization (Role-based)              │
│  • Check user role                          │
│  • admin or superadmin required             │
│  • Granular action permissions              │
│  → 403 if insufficient permissions          │
└──────────┬──────────────────────────────────┘
           │
           ↓
┌─────────────────────────────────────────────┐
│     Resource Ownership (Audit)              │
│  • Verify account exists                    │
│  • Check account status                     │
│  • Log admin action                         │
│  • Create immutable audit trail             │
└──────────┬──────────────────────────────────┘
           │
           ↓
┌─────────────────────────────────────────────┐
│    Database Integrity (Transactions)        │
│  • ACID transactions                        │
│  • All-or-nothing updates                   │
│  • Atomic balance changes                   │
│  • Rollback on failure                      │
└─────────────────────────────────────────────┘
```

---

## Performance Considerations

### Database Indexes
```
Index Strategy:
├── User
│   ├── email (unique)
│   ├── role (for admin queries)
│   ├── supervisorId (for hierarchy)
│   └── status (for filtering)
├── Account
│   ├── userId (for user lookups)
│   ├── status (for filtering)
│   ├── accountNumber (unique)
│   └── createdAt
├── Transaction
│   ├── accountId (primary filter)
│   ├── userId (user lookups)
│   ├── timestamp (sorting)
│   └── type (filtering)
├── AdminActionLog
│   ├── adminId (admin activity)
│   ├── createdAt (sorting)
│   ├── targetId (lookup)
│   └── action (filtering)
└── AccountLog
    ├── accountId (lookups)
    └── createdAt (sorting)
```

### Query Optimization
```
Pagination Pattern:
GET /api/transactions/history?limit=50&skip=0
├── Fetch: limit+1 records
├── Check: if count > limit → hasNextPage
├── Return: limit records + nextCursor
└── Client: use cursor for next page

Benefits:
✓ O(1) cursor navigation
✓ Handles deleted records gracefully
✓ Efficient even with millions of records
```

---

## Error Handling Strategy

```
Error Flow:
                                    
┌──────────────────────────────────┐
│  Client makes request            │
└──────────┬───────────────────────┘
           │
           ↓
┌──────────────────────────────────┐
│  Server processes request        │
└──────────┬───────────────────────┘
           │
       ┌───┴───┬────────────────────┐
       │       │                    │
       ↓       ↓                    ↓
    ┌─────┐ ┌──────────┐    ┌──────────────┐
    │Auth │ │Validation│    │  Business    │
    │Fail │ │Error     │    │  Logic Error │
    └──┬──┘ └────┬─────┘    └──────┬───────┘
       │         │                 │
       │         ↓                 ↓
       │    ┌────────┐    ┌────────────────┐
       │    │ Zod    │    │ Account not    │
       │    │ Error  │    │ found or       │
       │    │ Details│    │ already status │
       │    └────┬───┘    └────┬───────────┘
       │         │             │
       ↓         ↓             ↓
    401      400 Bad        404 Not Found
    Response Request        or
                           400 Bad Request
```

---

## Audit Trail Architecture

```
Every Admin Action Creates:

┌───────────────────────────────┐
│  AdminActionLog Entry         │
├───────────────────────────────┤
│ adminId: "who did it"         │
│ action: "what they did"       │
│ targetType: "account|user"    │
│ targetId: "what they did it to"
│ reason: "why"                 │
│ metadata: { ...context }      │
│ createdAt: timestamp          │
└───────────────────────────────┘

Immutable: Can't be deleted/edited
Indexed: Fast lookup by adminId, targetId
Comprehensive: Tracks all changes

Benefits:
✓ Complete audit trail
✓ Compliance & regulations
✓ Accountability
✓ Dispute resolution
✓ Forensic analysis
```

---

**Architecture Version**: 1.0  
**Technology Stack**: Next.js + TypeScript + Prisma + MongoDB  
**Date**: February 1, 2026
