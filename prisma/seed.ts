import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";
import { z } from "zod";

const prisma = new PrismaClient();

const envSchema = z.object({
  SUPERADMIN_EMAIL: z.string().email(),
  SUPERADMIN_PASSWORD: z.string().min(6),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(6),
  USER_EMAIL: z.string().email().optional(),
  USER_PASSWORD: z.string().min(6).optional(),
});

const parsed = envSchema.safeParse({
  SUPERADMIN_EMAIL: process.env.SUPERADMIN_EMAIL,
  SUPERADMIN_PASSWORD: process.env.SUPERADMIN_PASSWORD,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  USER_EMAIL: process.env.USER_EMAIL,
  USER_PASSWORD: process.env.USER_PASSWORD,
});

// Validate the parsed data if it is !successful
if (!parsed.success) {
  console.error("Invalid environment variables for seeding");
  throw new Error("Invalid environment variables");
}

const env = parsed.data;

async function main() {
  const {
    SUPERADMIN_EMAIL,
    SUPERADMIN_PASSWORD,
    ADMIN_EMAIL,
    ADMIN_PASSWORD,
    USER_EMAIL,
    USER_PASSWORD,
  } = env;

  const userEmail = USER_EMAIL ?? "john@example.com";
  const userPasswordRaw = USER_PASSWORD ?? "user123";

  console.log("Seeding database...");

  // Delete existing users (optional - remove in production)
  // await prisma.user.deleteMany({});

  const superadminPassword = await bcryptjs.hash(SUPERADMIN_PASSWORD, 10);
  const superadmin = await prisma.user.upsert({
    where: { email: SUPERADMIN_EMAIL },
    update: {
      name: "SuperAdmin User",
      password: superadminPassword,
      role: "superadmin",
      phone: "+1-555-0099",
      address: "999 Executive Blvd, City, State",
      emailVerified: true,
    },
    create: {
      email: SUPERADMIN_EMAIL,
      name: "SuperAdmin User",
      password: superadminPassword,
      role: "superadmin",
      phone: "+1-555-0099",
      address: "999 Executive Blvd, City, State",
      emailVerified: true,
    },
  });

  const adminPassword = await bcryptjs.hash(ADMIN_PASSWORD, 10);
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      name: "Admin User",
      password: adminPassword,
      role: "admin",
      phone: "+1-555-0100",
      address: "123 Main St, City, State",
      emailVerified: true,
    },
    create: {
      email: ADMIN_EMAIL,
      name: "Admin User",
      password: adminPassword,
      role: "admin",
      phone: "+1-555-0100",
      address: "123 Main St, City, State",
      emailVerified: true,
    },
  });

  const userPassword = await bcryptjs.hash(userPasswordRaw, 10);
  const user = await prisma.user.upsert({
    where: { email: userEmail },
    update: {
      name: "John Doe",
      password: userPassword,
      role: "user",
      phone: "+1-555-0102",
      address: "789 Pine Rd, City, State",
      emailVerified: true,
    },
    create: {
      email: userEmail,
      name: "John Doe",
      password: userPassword,
      role: "user",
      phone: "+1-555-0102",
      address: "789 Pine Rd, City, State",
      emailVerified: true,
    },
  });

  console.log("Seed completed");
  console.log("-------------------");
  console.log(`SUPERADMIN: ${superadmin.email}`);
  console.log(`ADMIN: ${admin.email}`);
  console.log(`USER: ${user.email}`);
  console.log("-------------------");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
