import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Delete existing users (optional - remove in production)
  // await prisma.user.deleteMany({});

  // Create superadmin user
  const superadminPassword = await bcryptjs.hash('superadmin123', 10);
  const superadmin = await prisma.user.upsert({
    where: { email: 'superadmin@bank.com' },
    update: {},
    create: {
      email: 'superadmin@bank.com',
      name: 'SuperAdmin User',
      password: superadminPassword,
      role: 'superadmin',
      phone: '+1-555-0099',
      address: '999 Executive Blvd, City, State',
      emailVerified: true,
    },
  });

  // Create admin user
  const adminPassword = await bcryptjs.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bank.com' },
    update: {},
    create: {
      email: 'admin@bank.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'admin',
      phone: '+1-555-0100',
      address: '123 Main St, City, State',
      emailVerified: true,
    },
  });

  // Create manager user
  // const managerPassword = await bcryptjs.hash('manager123', 10);
  // const manager = await prisma.user.upsert({
  //   where: { email: 'manager@bank.com' },
  //   update: {},
  //   create: {
  //     email: 'manager@bank.com',
  //     name: 'Manager User',
  //     password: managerPassword,
  //     role: 'manager',
  //     phone: '+1-555-0101',
  //     address: '456 Oak Ave, City, State',
  //     emailVerified: true,
  //   },
  // });

  // Create regular user
  const userPassword = await bcryptjs.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      name: 'John Doe',
      password: userPassword,
      role: 'user',
      phone: '+1-555-0102',
      address: '789 Pine Rd, City, State',
      emailVerified: true,
    },
  });

  console.log('✅ Seed completed!');
  console.log('\n📧 Test Accounts:');
  console.log('-------------------');
  console.log('SUPERADMIN:');
  console.log('  Email: superadmin@bank.com');
  console.log('  Password: superadmin123');
  console.log('\nADMIN:');
  console.log('  Email: admin@bank.com');
  console.log('  Password: admin123');
  console.log('\nMANAGER:');
  // console.log('  Email: manager@bank.com');
  // console.log('  Password: manager123');
  console.log('\nUSER:');
  console.log('  Email: john@example.com');
  console.log('  Password: user123');
  console.log('-------------------\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    // process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
