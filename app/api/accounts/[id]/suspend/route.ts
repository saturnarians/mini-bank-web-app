import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth/guard';
import { adminController } from '@/lib/controllers/adminController';
import { z } from 'zod';

const statusSchema = z.object({
  status: z.enum(['active', 'suspended', 'closed']),
});

export const PATCH = authorize(['admin', 'superadmin'], async (req, { params }) => {
  try {
    const { id } = params;
    const body = await req.json();
    
    // Validate input
    const validatedData = statusSchema.parse(body);

    // Call Controller -> Service
    const updatedAccount = await adminController.toggleAccountStatus(
      id, 
      validatedData.status
    );

    return NextResponse.json(updatedAccount);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});