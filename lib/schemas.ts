import { z } from 'zod';
const accountTypeEnum = z.enum(['checking', 'savings', 'investment']);

// -------------------- Auth --------------------
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  accountType: accountTypeEnum.optional(),
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

// Resume Account
export const resumeAccountSchema = z.object({
  reason: z.string().min(3, 'Please provide a reason')
});

// -------------------- Transaction --------------------
//--------Output / domain schema(server --> client)-----------
export const transactionSchema = z
  .object({
    type: z.enum(['deposit', 'withdrawal', 'transfer']),
    amount: z.number().positive('Amount must be greater than 0'),
    description: z.string().min(1, 'Description is required'),
    recipientAccountId: z.string().optional(), // only needed for transfers
    runningBalance: z.number(),
    status: z.enum(['pending', 'completed', 'failed']),
    accountId: z.string(),
    timestamp: z.string().datetime(),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'transfer' && !data.recipientAccountId) {
      ctx.addIssue({
        path: ['recipientAccountId'],
        message: 'Recipient account is required for transfers',
        code: z.ZodIssueCode.custom,
      });
    }
  });

  //--------Input schema( client --> server )-----------
export const createTransactionSchema = z.object({
  type: z.enum(['deposit', 'withdrawal', 'transfer']),
  amount: z.number().positive('Amount must be greater than 0'),
  recipientAccountId: z.string().optional(), // only needed for transfers
  description: z.string().min(1, 'Description is required'),
});

// -------------------Profile Update--------------------------------------

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
})

// --------------Adjust Balance--------------------
export const adminAdjustBalanceSchema = z.object({
  accountId: z.string(),
  amount: z.number().refine(v => v !== 0),
  reason: z.string().min(10, "Reason required"),
})

// -------------------- User --------------------
export const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  phone: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(['superadmin', 'admin', 'user']),
});

// -------------------- Admin Transaction Approval --------------------
export const approveTransactionSchema = z.object({
  transactionId: z.string(),
  reason: z.string().optional(),
});

export const rejectTransactionSchema = z.object({
  transactionId: z.string(),
  rejectionReason: z.string().min(5, "Rejection reason must be at least 5 characters"),
});

export const externalTransferSchema = z.object({
  amount: z
    .number({
      required_error: 'Amount is required',
      invalid_type_error: 'Amount must be a number',
    })
    .positive('Amount must be greater than zero'),

  recipientBank: z
    .string()
    .min(1, 'Recipient bank is required'),

  recipientAccountNumber: z.coerce
  .number({
    required_error: 'Account Number is required',
    invalid_type_error: 'Account Number must be a number',
  })
  .min(1000000000, 'Account number is too short'), // 10+ digits numeric


  recipientName: z
    .string()
    .min(2, 'Recipient name is required'),

  swiftCode: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9]+$/, 'SWIFT code must be alphanumeric')
    .optional()
    .or(z.literal('')),

  iban: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9]+$/, 'IBAN must be alphanumeric')
    .optional()
    .or(z.literal('')),

  routingNumber: z.coerce
  .number()
  .optional(),
    // .or(z.literal('')),

  description: z
    .string()
    .optional()
    .or(z.literal('')),
});

// -------------------- Export TypeScript types --------------------
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type AccountFormData = z.infer<typeof accountSchema>;       // entity shape for full Account
export type CreateAccountFormData = z.infer<typeof createAccountSchema>; // input shape
export type UpdateAccountFormData = z.infer<typeof updateAccountSchema>;
export type SuspendAccountFormData = z.infer<typeof suspendAccountSchema>;
export type suspendAccountFormData =  z.infer<typeof resumeAccountSchema>;
export type TransactionFormData = z.infer<typeof transactionSchema>;
export type UserFormData = z.infer<typeof userSchema>;
export type AdminAdjustBalanceFormData = z.infer<typeof adminAdjustBalanceSchema>;
export type createTransactionFormData = z.infer<typeof createTransactionSchema>;
export type updateProfileFormData = z.infer<typeof updateProfileSchema>;
export type ApproveTransactionFormData = z.infer<typeof approveTransactionSchema>;
export type RejectTransactionFormData = z.infer<typeof rejectTransactionSchema>;
export type ExternalTransferFormData = z.infer<typeof externalTransferSchema>

