import prisma from '@/lib/prisma';

export const profileService = {
  async getProfile(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        address: true,
        profilePhotoUrl: true,
        idCardUrl: true,
        kycStatus: true,
        kycUpdatedAt: true,
        emailVerified: true,
        transactionPinHash: true,
        createdAt: true,
      },
    });
  },

  async updateProfile(userId: string, data: any) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        address: true,
        profilePhotoUrl: true,
        idCardUrl: true,
        kycStatus: true,
        kycUpdatedAt: true,
        emailVerified: true,
        transactionPinHash: true,
        createdAt: true,
      },
    });
  },

  async updatePassword(userId: string, hashedNamePassword: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { password: hashedNamePassword },
    });
  }
};
