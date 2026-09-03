import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Create Default Admin User
  const adminPasswordHash = await argon2.hash('admin123', { type: argon2.argon2id });
  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@mitao.com' },
    update: {},
    create: {
      email: 'admin@mitao.com',
      passwordHash: adminPasswordHash,
      name: 'Super Admin',
      role: 'super_admin',
      twoFactorEnabled: false, // Set to false initially so we can log in and set it up
    },
  });
  console.log(`✅ Super Admin created: ${admin.email}`);

  // 2. Create Sourcing Provider
  const dsfulfill = await prisma.sourcingProvider.upsert({
    where: { key: 'dsfulfill' },
    update: {},
    create: {
      name: 'DSFulfill',
      key: 'dsfulfill',
      baseUrl: 'https://api.dsfulfill.com/v1',
      markupRules: { baseMarkupMultiplier: 1.4, flatFeeUSD: 2.0 },
    },
  });
  console.log(`✅ Sourcing Provider created: ${dsfulfill.name}`);

  // 3. Create initial Exchange Rates (just as placeholders)
  await prisma.exchangeRate.upsert({
    where: { fromCurrency_toCurrency: { fromCurrency: 'USD', toCurrency: 'NGN' } },
    update: {},
    create: { fromCurrency: 'USD', toCurrency: 'NGN', rate: 1600.00 },
  });
  await prisma.exchangeRate.upsert({
    where: { fromCurrency_toCurrency: { fromCurrency: 'USD', toCurrency: 'CNY' } },
    update: {},
    create: { fromCurrency: 'USD', toCurrency: 'CNY', rate: 7.20 },
  });
  console.log(`✅ Exchange rates seeded`);

  // 4. Create Feature Flags
  await prisma.featureFlag.upsert({
    where: { key: 'enable_referrals' },
    update: {},
    create: { key: 'enable_referrals', enabled: true, rolloutPercentage: 100, description: 'Enable referral program' },
  });
  await prisma.featureFlag.upsert({
    where: { key: 'enable_1688_import' },
    update: {},
    create: { key: 'enable_1688_import', enabled: true, rolloutPercentage: 100, description: 'Enable direct 1688 import tool for users' },
  });
  console.log(`✅ Feature flags seeded`);

  console.log('🌱 Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
