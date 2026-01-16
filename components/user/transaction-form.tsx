"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionSchema, type TransactionFormData } from '@/lib/schemas';
import { useAppSelector } from '@/store/hooks';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from "lucide-react"; // Using standard Lucide loader

interface TransactionFormProps {
  accountId: string;
  isLoading?: boolean;
  onSubmit: (data: TransactionFormData) => void;
  onCancel: () => void;
}

export function TransactionForm({
  accountId,
  isLoading,
  onSubmit,
  onCancel,
}: TransactionFormProps) {
  const { accounts } = useAppSelector(state => state.accounts);
  
  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      // Highlighting changes: Defaulting to 'transfer' logic
      type: 'transfer',
      amount: 0,
      description: '',
      recipientAccountId: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Recipient Selection */}
        <FormField
          control={form.control}
          name="recipientAccountId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recipient Account</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select where to send money" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {/* Internal Accounts */}
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    My Accounts
                  </div>
                  {accounts
                    .filter(acc => acc.id !== accountId)
                    .map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.accountType} (****{acc.accountNumber.slice(-4)})
                      </SelectItem>
                    ))}
                  
                  {/* External Logic could be added here */}
                </SelectContent>
              </Select>
              <FormDescription>Choose an account to transfer funds to.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Amount Input */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                  <Input
                    className="pl-7"
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    disabled={isLoading}
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </div>
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
              <FormLabel>Note</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Monthly Rent"
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
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Send Payment'
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
  );
}