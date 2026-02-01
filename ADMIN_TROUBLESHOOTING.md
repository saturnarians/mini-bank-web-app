# Admin UI Refactoring - Troubleshooting Guide

## Common Issues & Solutions

### 1. AdminDashboard Not Loading Accounts

**Symptom**: "No accounts found" or loading skeleton stays forever

**Possible Causes & Solutions**:

```
A. API endpoint not responding
   ✓ Check: GET /api/accounts returns 200 status
   ✓ Check: Authorization header is being sent
   ✓ Check: User has admin/superadmin role
   ✓ Solution: Verify database connection and JWT token validity

B. CORS issues
   ✓ Check: Browser console for CORS errors
   ✓ Solution: Verify API CORS headers are set correctly

C. Wrong API path
   ✓ Check: AdminDashboard uses '/api/accounts' (not '/api/admin/accounts')
   ✓ Verify: Endpoint matches route.ts file location
```

**Debug Steps**:
1. Open browser DevTools → Network tab
2. Look for `/api/accounts` request
3. Check response status and body
4. Verify response matches Account[] type

---

### 2. Search/Filter Not Working

**Symptom**: Search term or status filter doesn't filter results

**Possible Causes & Solutions**:

```
A. Search term not matching
   ✓ Check: Account number format (full match? partial match?)
   ✓ Check: User name/email exists in account object
   ✓ Solution: Log account data to verify structure:
     console.log('Account data:', account);

B. Filter status not matching
   ✓ Check: Account status values in database (lowercase?)
   ✓ Check: Status filter options match database values
   ✓ Solution: Update filter options to match actual status values:
     <option value="active">Active</option>
     <option value="suspended">Suspended</option>

C. Filter state not updating
   ✓ Check: onChange handlers properly bound
   ✓ Check: State updates trigger re-renders
```

**Debug Code**:
```typescript
// Add to AdminDashboard
console.log('Search term:', searchTerm);
console.log('Filter status:', filterStatus);
console.log('All accounts:', accounts);
console.log('Filtered accounts:', filteredAccounts);
```

---

### 3. Dialogs Not Opening/Closing

**Symptom**: Dialog appears but doesn't open, or doesn't close on success

**Possible Causes & Solutions**:

```
A. Dialog state not updating
   ✓ Check: onClick handlers call correct setState
   ✓ Check: Dialog open prop correctly bound
   ✓ Example: <AccountSuspendResumeDialog 
       isOpen={suspendDialogOpen}
       onOpenChange={setSuspendDialogOpen}
     />

B. onOpenChange not called
   ✓ Check: Dialog component calls onOpenChange(false)
   ✓ Check: setTimeout fires correctly
   ✓ Solution: Verify onOpenChange prop is passed to Dialog

C. Selected account is null
   ✓ Check: handleSuspend/handleResume set selectedAccount
   ✓ Check: selectedAccount passed to dialog:
     <AccountSuspendResumeDialog account={selectedAccount} />
```

**Debug Steps**:
1. Add console.log in onClick handler:
   ```typescript
   const handleSuspend = (account: Account) => {
     console.log('Suspend clicked:', account);
     setSelectedAccount(account);
     setSuspendDialogOpen(true);
   };
   ```
2. Check browser DevTools console for logs
3. Verify Dialog component receives props

---

### 4. Dialog Submit Not Working

**Symptom**: Click submit button but nothing happens or error persists

**Possible Causes & Solutions**:

```
A. Form validation failing silently
   ✓ Check: Reason field has >= 5 characters
   ✓ Check: Balance is valid number and >= 0
   ✓ Solution: Add visual validation feedback:
     {reason.length < 5 && (
       <span className="text-xs text-red-600">
         Reason must be at least 5 characters
       </span>
     )}

B. API endpoint not found
   ✓ Check: Suspend uses: /api/admin/accounts/suspend
   ✓ Check: Resume uses: /api/admin/accounts/resume
   ✓ Check: Balance uses: /api/admin/accounts/create-balance
   ✓ Verify: Files exist in correct directories

C. API request unauthorized (401)
   ✓ Check: User has admin/superadmin role
   ✓ Check: JWT token in cookie is valid
   ✓ Check: Cookie is being sent with request
   ✓ Solution: Add credentials to fetch:
     fetch(url, {
       method: 'POST',
       credentials: 'include', // Include cookies
       ...
     })

D. Request body format incorrect
   ✓ Check: suspend/resume expect: { accountId, reason }
   ✓ Check: create-balance expects: { accountId, balance, reason }
   ✓ Solution: Log request body:
     console.log('Request body:', JSON.stringify({
       accountId: account.id,
       reason,
     }));
```

**Debug Steps**:
1. Open DevTools → Network tab
2. Find the POST request
3. Check Response tab for error message
4. Check Request tab for body format
5. Compare with expected format

---

### 5. Transaction History Not Loading

**Symptom**: TransactionHistoryViewer shows "No transactions found"

**Possible Causes & Solutions**:

```
A. AccountId not being passed
   ✓ Check: historyAccountId is set correctly
   ✓ Check: handleViewHistory sets historyAccountId:
     const handleViewHistory = (accountId: string) => {
       console.log('Viewing history for:', accountId);
       setHistoryAccountId(accountId);
     };

B. Date filtering too restrictive
   ✓ Check: Start date is before end date
   ✓ Check: Date range includes actual transactions
   ✓ Check: Dates formatted correctly (YYYY-MM-DD)
   ✓ Solution: Clear filters and try without date range

C. Account has no transactions
   ✓ Check: Database has transactions for this account
   ✓ Check: Account ID exists in transaction.accountId field
   ✓ Solution: Test with account known to have transactions

D. API not returning data in correct format
   ✓ Check: Response includes: { transactions: [], total: number }
   ✓ Check: Each transaction has required fields
```

**Test Query**:
```typescript
// Manually test in browser console
fetch('/api/transactions/history?accountId=TEST_ACCOUNT_ID&limit=50&skip=0')
  .then(r => r.json())
  .then(console.log)
```

---

### 6. Date Filtering Issues

**Symptom**: Date filters don't work or API returns no results

**Possible Causes & Solutions**:

```
A. Date format incorrect
   ✓ Check: Should be ISO format: YYYY-MM-DD
   ✓ Check: API adds T00:00:00Z and T23:59:59Z
   ✓ Correct format: 2024-01-15T00:00:00Z

B. Time zone issues
   ✓ API expects UTC time
   ✓ Date input provides local date
   ✓ Solution: Already handled by adding T00:00:00Z

C. Dates in wrong order
   ✓ Check: Start date <= end date
   ✓ Solution: Add validation in TransactionHistoryViewer:
     if (startDate && endDate && startDate > endDate) {
       setError('Start date must be before end date');
       return;
     }
```

**Verify Date Handling**:
```typescript
// In browser console
const startDate = "2024-01-15";
const formattedStart = `${startDate}T00:00:00Z`;
console.log(formattedStart); // Should show: 2024-01-15T00:00:00Z
```

---

### 7. Permission/Authorization Errors (403)

**Symptom**: Getting "Forbidden" or "Unauthorized" errors

**Possible Causes & Solutions**:

```
A. User not admin/superadmin
   ✓ Check: JWT token contains role: 'admin' or 'superadmin'
   ✓ Check: Token not expired
   ✓ Solution: Login again to refresh token

B. API requires different role
   ✓ Check: Endpoint authorize() requires which roles?
   ✓ Check: /api/accounts requires: 'user', 'admin', 'superadmin'
   ✓ Check: /api/admin/accounts/* requires: 'admin', 'superadmin'

C. Session not sent with request
   ✓ Check: JWT is in HTTP-only cookie
   ✓ Check: fetch includes credentials:
     fetch(url, { credentials: 'include' })
   ✓ Check: Cookie matches domain/path
```

**Debug Session**:
```javascript
// In browser console
document.cookie; // Show all cookies
// Look for 'token' or 'auth' cookie with JWT value
```

---

### 8. State Not Updating After API Call

**Symptom**: Dialog succeeds but account list doesn't refresh

**Possible Causes & Solutions**:

```
A. onSuccess callback not called
   ✓ Check: Dialog passes onSuccess prop:
     <CreateBalanceDialog 
       onSuccess={handleDialogSuccess}
     />
   ✓ Check: Dialog calls onSuccess?.():
     setTimeout(() => {
       onSuccess?.();
     }, 2000);

B. handleDialogSuccess not calling fetchAccounts
   ✓ Check: Implementation:
     const handleDialogSuccess = () => {
       fetchAccounts();
     };

C. fetchAccounts not updating state
   ✓ Check: setAccounts is called with response data
   ✓ Check: Response is array of accounts
   ✓ Solution: Verify API response format
```

**Debug Steps**:
1. Add console.log in handleDialogSuccess:
   ```typescript
   const handleDialogSuccess = () => {
     console.log('Dialog success, refreshing accounts...');
     fetchAccounts();
   };
   ```
2. Check console after successful dialog submission
3. Verify account list updates

---

### 9. Styling/UI Issues

**Symptom**: Components not styled correctly or look broken

**Possible Causes & Solutions**:

```
A. Tailwind CSS not applied
   ✓ Check: build runs: npm run build
   ✓ Check: No Tailwind purging issues
   ✓ Solution: Rebuild: npm run dev

B. UI component imports missing
   ✓ Check: All UI components imported:
     import { Button } from '@/components/ui/button';
     import { Card } from '@/components/ui/card';
     import { Dialog, DialogContent, ... } from '@/components/ui/dialog';
   ✓ Solution: Verify imports match file structure

C. Dark mode not working
   ✓ Check: dark: prefixes in className
   ✓ Check: Tailwind config includes darkMode
```

---

### 10. Type Errors at Build Time

**Symptom**: TypeScript compilation errors

**Possible Causes & Solutions**:

```
A. Account type mismatch
   ✓ Check: Account type imported from @/lib/types
   ✓ Check: All required properties present
   ✓ Solution: Verify types match between frontend and backend

B. Missing optional properties
   ✓ Check: user?: User (optional)
   ✓ Check: createdAt?: Date (optional)
   ✓ Solution: Use optional chaining: account.user?.name

C. Type imports missing
   ✓ Check: import { Account, Transaction } from '@/lib/types';
   ✓ Solution: Verify import path matches file location
```

**Build & Type Check**:
```bash
npm run build  # Full build with type check
npm run dev    # Development with type check
```

---

## Quick Diagnostic Checklist

✓ Run through this when troubleshooting:
- [ ] Is Next.js build successful? (`npm run build`)
- [ ] Are API endpoints responding? (DevTools Network tab)
- [ ] Is user authenticated and authorized? (JWT in cookies)
- [ ] Are component props correctly passed? (React DevTools)
- [ ] Are API response formats correct? (DevTools Network tab)
- [ ] Are dates properly formatted? (ISO format with T00:00:00Z)
- [ ] Are all imports correct? (Check file paths)
- [ ] Are Tailwind styles applied? (Check class names)
- [ ] Is console showing errors? (DevTools Console)
- [ ] Have you tried clearing browser cache? (Hard refresh)

---

## Useful Debug Commands

```bash
# Build and check for errors
npm run build

# Run dev server with console output
npm run dev

# Check TypeScript compilation
npx tsc --noEmit

# View network requests (DevTools)
# Press F12 → Network → Refresh page
```

## Browser Console Debugging

```javascript
// Check authentication
document.cookie

// Check component data
console.log('Accounts:', accounts);
console.log('Filtered:', filteredAccounts);
console.log('Selected:', selectedAccount);

// Manually test API
fetch('/api/accounts')
  .then(r => r.json())
  .then(console.log)

// Test admin endpoint
fetch('/api/admin/accounts/suspend', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    accountId: 'TEST_ID',
    reason: 'Testing admin endpoint'
  })
})
  .then(r => r.json())
  .then(console.log)
```

---

## Need Help?

1. **Check logs**: DevTools Console for JavaScript errors
2. **Check network**: DevTools Network tab for API errors
3. **Check types**: Build output for TypeScript errors
4. **Check data**: Log component state and props
5. **Check endpoints**: Verify routes exist and respond

For more details, see `ADMIN_REFACTORING_COMPLETE.md`
