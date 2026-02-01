1. The sender account shouldn't be able to make transactions to its account but external account through form inputs that later shows successful.

2. no shared dashboard, sidebar with user and admin/superadmin, admin/superadmin should have their own sidebar, superadmin and admin should have access to same dashboard and superadmin and admin should be able to suspend account, resume account and be able to adjust date of user created,
transaction created, account created.

3. where can i see the suspend and resume admin and superadmin button on admin-panel dashboard


4. when page reloads/refreshes from the dashboard it, it breaks and doesn't show again it shows:
 GET /admin-panel 200 in 66ms (compile: 7ms, render: 59ms)
 GET /dashboard 200 in 83ms (compile: 9ms, render: 73ms)
GUARD CHECK { isAuthenticated: false }
 GET /dashboard 200 in 2.1s (compile: 19ms, render: 2.1s)
Incoming cookies: RequestCookies {
  _parsed: Map(2) {
    '__next_hmr_refresh_hash__' => { name: '__next_hmr_refresh_hash__', value: '452' },
    'token' => {
      name: 'token',
      value: 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjY5NTNjOTMwNjg1MmU2NWJhMTY0MDRhMCIsIm5hbWUiOiJBZG1pbiBVc2VyIiwiZW1haWwiOiJhZG1pbkBiYW5rLmNvbSIsInJvbGUiOiJhZG1pbiIsImVtYWlsVmVyaWZpZWQiOnRydWUsImV4cCI6MTc2OTg0ODM4Mn0.s5xnEBrtQ-1Nu1Cs_y1Ol1T3UM2bz4y2oLvZIO_dPHA'
    }
  },
  _headers: Headers {
    host: 'localhost:3000',
    connection: 'keep-alive',
    'sec-ch-ua-platform': '"Windows"',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',
    'sec-ch-ua': '"Not(A:Brand";v="8", "Chromium";v="144", "Microsoft Edge";v="144"',
    'content-type': 'application/json',
    'sec-ch-ua-mobile': '?0',
    accept: '*/*',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-mode': 'cors',
    'sec-fetch-dest': 'empty',
    referer: 'http://localhost:3000/dashboard',
    'accept-encoding': 'gzip, deflate, br, zstd',
    'accept-language': 'en-US,en;q=0.9',
    cookie: '__next_hmr_refresh_hash__=452; token=eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjY5NTNjOTMwNjg1MmU2NWJhMTY0MDRhMCIsIm5hbWUiOiJBZG1pbiBVc2VyIiwiZW1haWwiOiJhZG1pbkBiYW5rLmNvbSIsInJvbGUiOiJhZG1pbiIsImVtYWlsVmVyaWZpZWQiOnRydWUsImV4cCI6MTc2OTg0ODM4Mn0.s5xnEBrtQ-1Nu1Cs_y1Ol1T3UM2bz4y2oLvZIO_dPHA',
    'x-forwarded-host': 'localhost:3000',
    'x-forwarded-port': '3000',
    'x-forwarded-proto': 'http',
    'x-forwarded-for': '::1'
  }
}
Session object: {
  id: '6953c9306852e65ba16404a0',
  name: 'Admin User',
  email: 'admin@bank.com',
  role: 'admin',
  emailVerified: true,
  exp: 1769848382
}
 GET /api/auth/me 200 in 1184ms (compile: 34ms, render: 1149ms)
 GET / 200 in 190ms (compile: 17ms, render: 172ms)