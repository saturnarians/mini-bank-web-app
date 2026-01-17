// lib/controllers/authController.ts
import { authService } from '@/lib/services/authService';
import { loginSchema, registerSchema } from '@/lib/schemas';
import type { User } from '@/lib/types'; // your user type
import { ZodError } from 'zod';
import { signToken, UserRole } from '@/lib/auth';

interface AuthResponseDTO {
  user: User;
  token: string;
  expiresIn?: number;
}

export const authController = {
  /**
   * Registers a new user
   * Returns the flat user object directly (no { user } nesting)
   */
  async register(body: unknown): Promise<AuthResponseDTO> {
    try {
      const data = registerSchema.parse(body);

      // authService.register should return User directly
      const user = await authService.register(data);

      if (!user) throw new Error('Registration failed');

      const expiresIn = 20 * 60; // 20 minutes

    const token = await signToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
      emailVerified: user.emailVerified,
    });

      return {user, token, expiresIn}; // flat user

    } catch (err) {
      if (err instanceof ZodError) throw err; // validation error
      throw err;
    }
  },

  /**
   * Logs in a user
   * Returns the flat user object directly (no { user } nesting)
   */
  async login(body: unknown): Promise<AuthResponseDTO> {
    try {
      const data = loginSchema.parse(body);

      const user = await authService.login(data);

      if (!user) throw new Error('Invalid credentials');

      const expiresIn = 20 * 60; // 20 minutes
      
      const token = await signToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
      emailVerified: user.emailVerified,
    });

      return { user, token, expiresIn }; // flat user
    } catch (err) {
      if (err instanceof ZodError) throw err;
      throw err;
    }
  },
};
