import { authService } from "@/lib/services/authService";
import { loginSchema, registerSchema } from "@/lib/schemas";
import type { User } from "@/lib/types";
import { ZodError } from "zod";

interface AuthResponseDTO {
  user: User;
}

export const authController = {
  /**
   * Registers a new user and creates the default account.
   */
  async register(body: unknown): Promise<AuthResponseDTO> {
    try {
      const data = registerSchema.parse(body);

      const serviceData = {
        email: data.email,
        name: data.name,
        password: data.password,
        transactionPin: data.transactionPin || undefined,
        accountType: data.accountType || "checking",
      };

      const user = await authService.register(serviceData);
      if (!user) throw new Error("Registration failed");

      return { user };
    } catch (err) {
      if (err instanceof ZodError) throw err;
      throw err;
    }
  },

  /**
   * Logs in a user by validating credentials only.
   */
  async login(body: unknown): Promise<AuthResponseDTO> {
    try {
      const data = loginSchema.parse(body);
      const user = await authService.login(data);

      if (!user) throw new Error("Invalid credentials");

      return { user };
    } catch (err) {
      if (err instanceof ZodError) throw err;
      throw err;
    }
  },
};
