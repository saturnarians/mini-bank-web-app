// lib/controllers/authController.ts
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken, setTokenCookie } from '@/lib/auth';
import { loginSchema } from '@/lib/schemas';

export const authController = {
  async login(body: any) {
    // 1. Validate input
    const { email, password } = loginSchema.parse(body);

    // 2. Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('INVALID_CREDENTIALS');

    // 3. Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error('INVALID_CREDENTIALS');

    // 4. Generate & Set Token
    const token = await signToken({
      id: user.id,
      email: user.email,
      role: user.role, // <--- Role enters the JWT system here
    });

    await setTokenCookie(token);

    // 5. Return sanitized user data
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
};