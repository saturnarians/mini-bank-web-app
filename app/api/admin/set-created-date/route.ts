import { NextResponse } from 'next/server'
import { authorize } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic';

const payloadSchema = z.object({
  entity: z.enum(['user', 'account', 'transaction']),
  id: z.string().min(1),
  newDate: z.string().min(1), // ISO date string
})

export const POST = authorize(['admin', 'superadmin'], async (req, { session }) => {
  const body = await req.json()
  const parsed = payloadSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  const { entity, id, newDate } = parsed.data
  const date = new Date(newDate)
  if (Number.isNaN(date.getTime())) return NextResponse.json({ error: 'Invalid date' }, { status: 400 })

  try {
    if (entity === 'user') {
      await prisma.user.update({ where: { id }, data: { createdAt: date } })
    } else if (entity === 'account') {
      await prisma.account.update({ where: { id }, data: { createdAt: date } })
    } else if (entity === 'transaction') {
      await prisma.transaction.update({ where: { id }, data: { timestamp: date } })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
})
