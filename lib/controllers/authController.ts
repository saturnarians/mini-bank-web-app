// lib/controllers/authController.ts
import { authService } from "@/lib/services/authService";
import { loginSchema, registerSchema } from "@/lib/schemas";
import type { User } from "@/lib/types"; // your user type
import { ZodError } from "zod";
import { signToken, UserRole } from "@/lib/auth";

interface AuthResponseDTO {
  user: User;
  token: string;
  expiresIn?: number;
}

export const authController = {
  /**
   * Registers a new user + Creates Account + Helper Token
   * Returns the flat user object directly (no { user } nesting)
   */
  async register(body: unknown): Promise<AuthResponseDTO> {
    try {
      // 1. Validate Body (Now includes accountType)
      const data = registerSchema.parse(body);

      // 2. Prepare data for Service
      // We explicitly exclude 'confirmPassword' and format 'accountType'
      const serviceData = {
        email: data.email,
        name: data.name,
        password: data.password,
        transactionPin: data.transactionPin || undefined,
        // Convert 'checking' -> 'CHECKING' for Prisma Enum consistency
        accountType: data.accountType || "checking",
      };

      // 3. Call Service
      const user = await authService.register(serviceData);

      if (!user) throw new Error("Registration failed");

      // 4. Generate Session Token (JWT)
      // Note: This is for Logging In. The *Verification Token* was generated inside authService.
      const expiresIn = 20 * 60; // 20 minutes
      const accessToken = await signToken({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as UserRole,
        emailVerified: user.emailVerified,
      });

      console.log(`🔑 Verification Token: ${accessToken}`);
      console.log(`🔓 Verification Token: ${user.email}`);
      console.log(
        `🔗 Manual Link: ${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify?token=${accessToken}`,
      );

      return { user, token: accessToken, expiresIn }; // flat user
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

      if (!user) throw new Error("Invalid credentials");

      const expiresIn = 20 * 60; // 20 minutes
      const accessToken = await signToken({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as UserRole,
        emailVerified: user.emailVerified,
      });

      return { user, token: accessToken, expiresIn }; // flat user
    } catch (err) {
      if (err instanceof ZodError) throw err;
      throw err;
    }
  },
};
