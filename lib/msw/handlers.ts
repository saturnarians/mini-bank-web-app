// import { http, HttpResponse } from 'msw';
// import { mockUsers, mockAccounts, mockTransactions } from '@/lib/mock-data';
// import { User, Account, Transaction } from '@/lib/types';

// let users = [...mockUsers];
// let accounts = [...mockAccounts];
// let transactions = [...mockTransactions];
// let currentUser: User | null = null;

// export const handlers = [
//   // Auth endpoints
//   http.post('/api/auth/login', async ({ request }) => {
//     const body = await request.json() as { email: string; password: string };
//     const user = users.find(u => u.email === body.email);
//     if (!user) {
//       return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
//     }
//     currentUser = user;
//     return HttpResponse.json(user);
//   }),

//   http.post('/api/auth/register', async ({ request }) => {
//     const body = await request.json() as { email: string; name: string; password: string };
//     const newUser: User = {
//       id: String(users.length + 1),
//       email: body.email,
//       name: body.name,
//       role: 'user',
//       createdAt: new Date().toISOString(),
//     };
//     users.push(newUser);
//     currentUser = newUser;
//     return HttpResponse.json(newUser);
//   }),

//   http.post('/api/auth/logout', () => {
//     currentUser = null;
//     return HttpResponse.json({ success: true });
//   }),

//   http.get('/api/auth/me', () => {
//     if (!currentUser) {
//       return HttpResponse.json({ error: 'Not authenticated' }, { status: 401 });
//     }
//     return HttpResponse.json(currentUser);
//   }),

//   // Accounts endpoints
//   http.get('/api/accounts', () => {
//     const userAccounts = currentUser ? accounts.filter(a => a.userId === currentUser.id) : [];
//     return HttpResponse.json(userAccounts);
//   }),

//   http.post('/api/accounts', async ({ request }) => {
//     const body = await request.json() as any;
//     const newAccount: Account = {
//       id: `acc-${accounts.length + 1}`,
//       userId: currentUser?.id || '',
//       accountNumber: body.accountNumber,
//       accountType: body.accountType,
//       balance: body.initialBalance,
//       currency: 'USD',
//       status: 'active',
//       createdAt: new Date().toISOString(),
//     };
//     accounts.push(newAccount);
//     return HttpResponse.json(newAccount);
//   }),

//   http.put('/api/accounts/:id', async ({ request, params }) => {
//     const body = await request.json() as Partial<Account>;
//     const accountIndex = accounts.findIndex(a => a.id === params.id);
//     if (accountIndex === -1) {
//       return HttpResponse.json({ error: 'Account not found' }, { status: 404 });
//     }
//     accounts[accountIndex] = { ...accounts[accountIndex], ...body };
//     return HttpResponse.json(accounts[accountIndex]);
//   }),

//   http.delete('/api/accounts/:id', ({ params }) => {
//     const accountIndex = accounts.findIndex(a => a.id === params.id);
//     if (accountIndex === -1) {
//       return HttpResponse.json({ error: 'Account not found' }, { status: 404 });
//     }
//     accounts.splice(accountIndex, 1);
//     return HttpResponse.json({ success: true });
//   }),

//   // Transactions endpoints
//   http.get('/api/transactions', ({ request }) => {
//     const url = new URL(request.url);
//     const accountId = url.searchParams.get('accountId');
//     const filtered = accountId 
//       ? transactions.filter(t => t.accountId === accountId)
//       : transactions;
//     return HttpResponse.json(filtered);
//   }),

//   http.post('/api/accounts/:accountId/transactions', async ({ request, params }) => {
//     const body = await request.json() as any;
//     const newTransaction: Transaction = {
//       id: `txn-${transactions.length + 1}`,
//       accountId: params.accountId as string,
//       type: body.type,
//       amount: body.amount,
//       currency: 'USD',
//       status: 'completed',
//       description: body.description,
//       recipientAccountId: body.recipientAccountId,
//       timestamp: new Date().toISOString(),
//       reference: `${body.type.toUpperCase()}-${new Date().getTime()}`,
//     };
//     transactions.push(newTransaction);
    
//     // Update account balance
//     const accountIndex = accounts.findIndex(a => a.id === params.accountId);
//     if (accountIndex !== -1) {
//       if (body.type === 'deposit') {
//         accounts[accountIndex].balance += body.amount;
//       } else if (body.type === 'withdrawal') {
//         accounts[accountIndex].balance -= body.amount;
//       } else if (body.type === 'transfer') {
//         accounts[accountIndex].balance -= body.amount;
//       }
//     }
    
//     return HttpResponse.json(newTransaction);
//   }),

//   // Users endpoints (admin only)
//   http.get('/api/users', () => {
//     if (currentUser?.role !== 'admin') {
//       return HttpResponse.json({ error: 'Unauthorized' }, { status: 403 });
//     }
//     return HttpResponse.json(users);
//   }),

//   http.post('/api/users', async ({ request }) => {
//     if (currentUser?.role !== 'admin') {
//       return HttpResponse.json({ error: 'Unauthorized' }, { status: 403 });
//     }
//     const body = await request.json() as any;
//     const newUser: User = {
//       id: String(users.length + 1),
//       ...body,
//       createdAt: new Date().toISOString(),
//     };
//     users.push(newUser);
//     return HttpResponse.json(newUser);
//   }),

//   http.put('/api/users/:id', async ({ request, params }) => {
//     if (currentUser?.role !== 'admin') {
//       return HttpResponse.json({ error: 'Unauthorized' }, { status: 403 });
//     }
//     const body = await request.json() as Partial<User>;
//     const userIndex = users.findIndex(u => u.id === params.id);
//     if (userIndex === -1) {
//       return HttpResponse.json({ error: 'User not found' }, { status: 404 });
//     }
//     users[userIndex] = { ...users[userIndex], ...body };
//     return HttpResponse.json(users[userIndex]);
//   }),

//   http.delete('/api/users/:id', ({ params }) => {
//     if (currentUser?.role !== 'admin') {
//       return HttpResponse.json({ error: 'Unauthorized' }, { status: 403 });
//     }
//     const userIndex = users.findIndex(u => u.id === params.id);
//     if (userIndex === -1) {
//       return HttpResponse.json({ error: 'User not found' }, { status: 404 });
//     }
//     users.splice(userIndex, 1);
//     return HttpResponse.json({ success: true });
//   }),
// ];
