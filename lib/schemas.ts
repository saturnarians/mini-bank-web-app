import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

//Account
export const accountSchema = z.object({
  accountNumber: z.string().min(10, 'Account number must be at least 10 characters'),
  accountType: z.enum(['checking', 'savings', 'investment']),
  initialBalance: z.coerce.number().min(0, 'Balance cannot be negative'),
  status: z.enum(['active', 'suspended', 'closed']).default('active'),
});

// 2. The Creation Schema (What the user sends in the POST request)
// We "pick" only the fields the user is allowed to set manually
export const createAccountSchema = accountSchema.pick({
  accountType: true,
  initialBalance: true, // Now balance is officially included!
});

// 3. The Update Schema (Optional fields for PATCH)
export const updateAccountSchema = createAccountSchema.partial();

// 4. Special Action Schemas
export const suspendAccountSchema = z.object({
  reason: z.string().min(3, 'Please provide a reason')
});

// Transaction
export const transactionSchema = z.object({
  type: z.enum([
    'deposit',
     'withdrawal',
     'transfer']),
  amount: z.number().positive('Amount must be greater than 0'),
  description: z.string().min(1, 'Description is required'),
  recipientAccountId: z.string().optional(),
});

export const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  phone: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(['superadmin', 'admin', 'manager', 'user']),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type AccountFormData = z.infer<typeof accountSchema>;
export type TransactionFormData = z.infer<typeof transactionSchema>;
export type UserFormData = z.infer<typeof userSchema>;
