// import { NextResponse } from 'next/server';
// import { getSessionFromCookies } from '@/lib/auth'; // <--- Import from your file
// import { processExternalTransfer } from '@/lib/banking-service';

// export async function POST(req: Request) {
//   try {
//     // 1. Check Admin Auth
//     const session = await getSessionFromCookies();

//     // Check if session exists AND if role is admin/superadmin
//     if (!session || (session.role !== 'admin' && session.role !== 'superadmin')) {
//       return NextResponse.json({ error: 'Forbidden: Admins Only' }, { status: 403 });
//     }

//     // 2. Get Data
//     const { transactionId, decision, rejectionReason } = await req.json();

//     if (!transactionId || !['approve', 'reject'].includes(decision)) {
//       return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
//     }

//     // 3. Call the Service Function
//     const result = await processExternalTransfer({
//       adminId: session.id, // The ID of the admin performing the action
//       transactionId,
//       decision,
//       rejectionReason
//     });

//     return NextResponse.json({ success: true, result });

//   } catch (error: any) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }