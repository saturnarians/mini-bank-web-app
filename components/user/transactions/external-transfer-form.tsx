'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateExternalTransferMutation } from '@/store/services/transactionsApi'
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ExternalTransferFormData, externalTransferSchema } from '@/lib/schemas';


interface ExternalTransferFormProps {
  isLoading?: boolean;
  onSubmit: (data: ExternalTransferFormData) => void;
  onCancel: () => void;
  // defaultAccountId: string;
  // onSuccess?: () => void;
}

export function ExternalTransferForm({ 
  isLoading,
  onSubmit,
  onCancel,
 }: ExternalTransferFormProps) {

  const { toast } = useToast();

  const form = useForm<ExternalTransferFormData>({
  resolver: zodResolver(externalTransferSchema),
  defaultValues: {
    amount: undefined,              // user must enter
    recipientBank: '',
    recipientAccountNumber: undefined,
    recipientName: '',
    swiftCode: undefined,
    iban: undefined,
    routingNumber: undefined,
    description: '',
    pin: '',
  },
});


  console.log('errors', form.formState.errors);
  return (
<Form 
{...form}
>
  <form
    onSubmit={form.handleSubmit(onSubmit)}
    className="space-y-3 overflow-y-auto max-h-[400px]"
  >
    {/* Amount */}
    <FormField
      control={form.control}
      name="amount"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Amount</FormLabel>
          <FormControl>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              disabled={isLoading}
              {...field}
              onChange={(e) => {
                const value = e.target.value;
                field.onChange(value === '' ? undefined : Number(value));
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    {/* Recipient Bank */}
    <FormField
      control={form.control}
      name="recipientBank"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Recipient Bank</FormLabel>
          <FormControl>
            <Input
              placeholder="e.g. Chase Bank"
              disabled={isLoading}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    {/* Recipient Name */}
    <FormField
      control={form.control}
      name="recipientName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Recipient Name</FormLabel>
          <FormControl>
            <Input
              placeholder="Account holder name"
              disabled={isLoading}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    {/* Recipient Account Number */}
    <FormField
      control={form.control}
      name="recipientAccountNumber"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Account Number</FormLabel>
          <FormControl>
            <Input
              placeholder="Recipient account number"
              disabled={isLoading}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    {/* SWIFT Code (Optional) */}
    <FormField
      control={form.control}
      name="swiftCode"
      render={({ field }) => (
        <FormItem>
          <FormLabel>SWIFT Code (Optional)</FormLabel>
          <FormControl>
            <Input
              placeholder="e.g. CHASUS33"
              disabled={isLoading}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    {/* IBAN (Optional) */}
    <FormField
      control={form.control}
      name="iban"
      render={({ field }) => (
        <FormItem>
          <FormLabel>IBAN (Optional)</FormLabel>
          <FormControl>
            <Input
              placeholder="International Bank Account Number"
              disabled={isLoading}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    {/* Routing Number (Optional) */}
    <FormField
      control={form.control}
      name="routingNumber"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Routing Number (Optional)</FormLabel>
          <FormControl>
            <Input
              placeholder="Routing number"
              disabled={isLoading}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    {/* Description */}
    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Description</FormLabel>
          <FormControl>
            <Input
              placeholder="e.g. Rent payment"
              disabled={isLoading}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    {/* Transaction PIN */}
    <FormField
      control={form.control}
      name="pin"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Transaction PIN</FormLabel>
          <FormControl>
            <Input
              type="password"
              placeholder="4-digit PIN"
              maxLength={4}
              disabled={isLoading}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    {/* Actions */}
    <div className="flex gap-3 pt-2">
      <Button
        type="submit"
        disabled={isLoading}
        className="flex-1"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing
          </>
        ) : (
          'Send Money'
        )}
      </Button>

      <Button
        type="button"
        variant="ghost"
        onClick={onCancel}
        disabled={isLoading}
      >
        Cancel
      </Button>
    </div>
  </form>
</Form>
  )
}
