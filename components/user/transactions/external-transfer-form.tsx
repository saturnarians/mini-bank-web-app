'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateExternalTransferMutation } from '@/store/services/transactionsApi'
import { useToast } from '@/hooks/use-toast'

const schema = z.object({
  accountId: z.string().min(1),
  amount: z.number().positive(),
  recipientBank: z.string().min(1),
  recipientAccountNumber: z.string().min(1),
  description: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function ExternalTransferForm({ defaultAccountId }: { defaultAccountId?: string }) {
  const [createExternal] = useCreateExternalTransferMutation()
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { accountId: defaultAccountId || '', amount: 0 } })
  const { toast } = useToast()

  const onSubmit = async (data: FormData) => {
    try {
      await createExternal(data).unwrap()
      toast({ title: 'Transfer submitted', description: 'External transfer created' })
      reset()
    } catch (err: any) {
      toast({ title: 'Transfer failed', description: err?.data?.error || err?.message || 'Server error' })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <label className="block text-sm font-medium">From Account</label>
        <input {...register('accountId')} className="input" />
        {errors.accountId && <p className="text-xs text-red-500">{errors.accountId.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Amount</label>
        <input type="number" step="0.01" {...register('amount', { valueAsNumber: true })} className="input" />
        {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Recipient Bank</label>
        <input {...register('recipientBank')} className="input" />
        {errors.recipientBank && <p className="text-xs text-red-500">{errors.recipientBank.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Recipient Account Number</label>
        <input {...register('recipientAccountNumber')} className="input" />
        {errors.recipientAccountNumber && <p className="text-xs text-red-500">{errors.recipientAccountNumber.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Description</label>
        <input {...register('description')} className="input" />
      </div>

      <div>
        <button disabled={isSubmitting} className="btn btn-primary">Send outside bank</button>
      </div>
    </form>
  )
}
