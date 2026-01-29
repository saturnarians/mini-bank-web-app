import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { generateVerificationToken, UserRole } from '@/lib/auth';
import { sendEmail, generateVerificationEmailHtml } from '@/lib/email';
import type { User, AccountStatus,  } from '@/lib/types';


// Helper function to generate account number
function generateAccountNumber() {
  return `AC${Math.floor(1000000000 + Math.random() * 9000000000)}`;
}


export const authService = {

async register(data: {
    email: string;
    name: string;
    password: string;
    accountType?: "checking" | "savings" | "investment"; // 1. Added optional type here
  }): Promise<User> {
    
    // 1. Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('USER_EXISTS');
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 3. Database Transaction: User + Account + Bonus
    const result = await prisma.$transaction(async (tx) => {
      
      // A. Create User
      const user = await tx.user.create({
        data: {
          email: data.email,
          name: data.name,
          password: hashedPassword,
          role: 'user', 
          emailVerified: false,
        },
      });

      // B. Create Default Account
      const account = await tx.account.create({
        data: {
          userId: user.id,
          accountType: data.accountType || "checking", 
          accountNumber: generateAccountNumber(),
          currency: "USD",
          status: "active",
          // balance: 100, 
        },
      });

      // C. Apply welcome bonus to account balance and record it as a transaction.
      const updatedAccount = await tx.account.update({
        where: { id: account.id },
        data: { balance: { increment: 100 } },
      });

      await tx.transaction.create({
        data: {
          accountId: account.id,
          amount: 100,
          type: "deposit",
          status: "completed",
          description: "Welcome Bonus",
          runningBalance: updatedAccount.balance,
          reference: `REG-BONUS-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`,
          metadata: {
            source: "registration_bonus",
            invariant: "SYSTEM_CREDIT_ONLY",
          },
        },
      });

      // Return the updated account (with incremented balance) so callers receive correct state
      return { user, account: updatedAccount };
    });

    console.log("------------------------------------------------");
   // console.log(`🚧 DEV MODE: Registration Successful for ${result.email}`);
    console.log("------------------------------------------------");

    // 4. Send Email (Done AFTER transaction succeeds)
    // try {
    //   const verificationToken = await generateVerificationToken(result.email);
    //   const verificationUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify?token=${verificationToken}`;

    //   await sendEmail({
    //     to: result.email,
    //     subject: 'Verify Your Email',
    //     html: generateVerificationEmailHtml(verificationUrl, result.name),
    //   });
    // } catch (emailError) {
    //   console.error("Failed to send verification email:", emailError);
    //   // We do not throw here, so the user is still registered even if email fails
    // }

    const { user, account } = result;

    // 5. Return formatted user
    return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as UserRole,
    createdAt: user.createdAt.toISOString(),
    emailVerified: user.emailVerified,
    accounts: [
      {
        id: account.id,
        userId: account.userId,
        accountType: account.accountType,
        accountNumber: account.accountNumber,
        currency: "USD",
        status: "active" as AccountStatus,
        createdAt: account.createdAt.toISOString(),
        balance: account.balance,
      },
    ],
    };
  },

  async login(data: { email: string; password: string }): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) throw new Error('INVALID_CREDENTIALS');

    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) throw new Error('INVALID_CREDENTIALS');

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      createdAt: user.createdAt.toISOString(),
      emailVerified: user.emailVerified,
    };
  },
};