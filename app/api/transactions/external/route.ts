import { NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/auth'; // Assuming you use NextAuth
import { transactionService } from '@/lib/services/transactionService'; // Import the function we wrote

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // 1. Check Authentication
    const session = await getSessionFromCookies();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get Data from Body
    const body = await req.json();
    const { 
      accountId, 
      amount, 
      recipientBank, 
      recipientAccountNumber, 
      recipientName, 
      swiftCode, 
      iban, 
      routingNumber, 
      description 
    } = body;

    // 3. Validation (Basic)
    if (!amount || !accountId || !recipientBank || !recipientAccountNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 4. Call the Service Function
    const transfer = await transactionService.createExternalTransfer({
    userId: session.id,
    accountId, // ⚠️ verify this exists
    amount: parseFloat(amount),
    recipientBank,
    recipientAccountNumber,
    recipientName,
    swiftCode,
    iban,
    routingNumber,
    description,
    });

    return NextResponse.json({ success: true, transfer });

  } catch (error: any) {
    console.error("Transfer Error:", error);
    return NextResponse.json({ error: error.message || 'Transfer failed' }, { status: 500 });
  }
}