import { z } from 'zod';

// -------------------- Auth --------------------
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"], // Highlights the confirm field on error
});

// -------------------- Account --------------------
export const accountSchema = z.object({
  accountNumber: z.string().min(10, 'Account number must be at least 10 characters'),
  accountType: z.enum(['checking', 'savings', 'investment']),
  initialBalance: z.coerce.number().min(0, 'Balance cannot be negative'),
  status: z.enum(['active', 'inactive', 'closed']).default('active'),
});

// Only fields the user can set when creating an account
export const createAccountSchema = accountSchema.pick({
  accountType: true,
  initialBalance: true,
});

// Optional fields for updating an account
export const updateAccountSchema = createAccountSchema.partial();

// Suspend Account
export const suspendAccountSchema = z.object({
  reason: z.string().min(3, 'Please provide a reason')
});

// -------------------- Transaction --------------------
export const transactionSchema = z
  .object({
    type: z.enum(['deposit', 'withdrawal', 'transfer']),
    amount: z.number().positive('Amount must be greater than 0'),
    accountId: z.string().min(1, 'Account is required'),
    recipientAccountId: z.string().optional(),
    description: z.string().min(1, 'Description is required'),
  })
  .superRefine((data, ctx) => {
    // transfer rules
    if (data.type === 'transfer' && !data.recipientAccountId) {
      ctx.addIssue({
        path: ['recipientAccountId'],
        message: 'Recipient account is required for transfers',
        code: z.ZodIssueCode.custom,
      });
    }
    if (data.type === 'transfer' && data.recipientAccountId === data.accountId) {
      ctx.addIssue({
        path: ['recipientAccountId'],
        message: 'Cannot transfer to the same account',
        code: z.ZodIssueCode.custom,
      });
    }
  });

// -------------------- User --------------------
export const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  phone: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(['superadmin', 'admin', 'manager', 'user']),
});

// -------------------- Export TypeScript types --------------------
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type AccountFormData = z.infer<typeof accountSchema>;       // entity shape for full Account
export type CreateAccountFormData = z.infer<typeof createAccountSchema>; // input shape
export type UpdateAccountFormData = z.infer<typeof updateAccountSchema>;
export type SuspendAccountFormData = z.infer<typeof suspendAccountSchema>;
export type TransactionFormData = z.infer<typeof transactionSchema>;
export type UserFormData = z.infer<typeof userSchema>;
