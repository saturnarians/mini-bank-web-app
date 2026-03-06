import { profileService } from "../services/profileService";
import { z } from "zod";
import bcrypt from 'bcryptjs';
import { prisma } from "@/lib/prisma";
// import { ZodError } from "zod";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  profilePhotoUrl: z.string().optional(),
  idCardUrl: z.string().optional(),
  kycStatus: z.enum(["not_submitted", "pending", "verified", "rejected"]).optional(),
  kycUpdatedAt: z.union([z.string().datetime(), z.null()]).optional(),
});

export const profileController = {
  async get(userId: string) {
    const user = await profileService.getProfile(userId);
    if (!user) throw new Error("USER_NOT_FOUND");
    const { transactionPinHash, ...safeUser } = user as any;
    return {
      ...safeUser,
      hasTransactionPin: !!transactionPinHash,
    };
  },

  async update(userId: string, body: any) {
    const validatedData = updateProfileSchema.parse(body);
    const normalized = {
      ...validatedData,
      kycUpdatedAt: validatedData.kycUpdatedAt
        ? new Date(validatedData.kycUpdatedAt)
        : validatedData.kycUpdatedAt === null
          ? null
          : undefined,
    };
    const updated = await profileService.updateProfile(userId, normalized);
    const { transactionPinHash, ...safeUser } = updated as any;
    return {
      ...safeUser,
      hasTransactionPin: !!transactionPinHash,
    };
  },

  async changePassword(userId: string, body: any) {
    const { currentPassword, newPassword } = changePasswordSchema.parse(body);

    // 1. Fetch user including password hash (which we usually exclude)
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("USER_NOT_FOUND");

    // 2. Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new Error("INVALID_CURRENT_PASSWORD");

    // 3. Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // 4. Update via service
    return await profileService.updatePassword(userId, hashedNewPassword);
  }
};
