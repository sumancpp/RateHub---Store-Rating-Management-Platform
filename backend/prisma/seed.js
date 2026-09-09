import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting RateHub Database Seeding ---');

  // Clear existing data for clean seed
  await prisma.rating.deleteMany({});
  await prisma.store.deleteMany({});
  await prisma.user.deleteMany({});

  const devPasswordHash = await bcrypt.hash('Password@123', 10);

  // 1. Create System Administrator
  const admin = await prisma.user.create({
    data: {
      name: 'System Administrator Admin',
      email: 'admin@ratehub.local',
      passwordHash: devPasswordHash,
      address: 'Suite 100, Admin Headquarters Plaza, Central City',
      role: 'ADMIN',
    },
  });
  console.log('Created Admin:', admin.email);

  // 2. Create Store Owner
  const storeOwner = await prisma.user.create({
    data: {
      name: 'Marcus Aurelius Store Owner',
      email: 'owner@ratehub.local',
      passwordHash: devPasswordHash,
      address: '450 Marketplace Avenue, Retail District, Central City',
      role: 'STORE_OWNER',
    },
  });
  console.log('Created Store Owner:', storeOwner.email);

  // 3. Create Normal Users
  const user1 = await prisma.user.create({
    data: {
      name: 'Alexander Hamilton Normal User',
      email: 'user1@ratehub.local',
      passwordHash: devPasswordHash,
      address: '124 Greenway Boulevard, Apartment 3B, Central City',
      role: 'USER',
    },
  });
  console.log('Created Normal User 1:', user1.email);

  const user2 = await prisma.user.create({
    data: {
      name: 'Charlotte Elizabeth Normal User',
      email: 'user2@ratehub.local',
      passwordHash: devPasswordHash,
      address: '789 Highland Ridge Road, West End, Central City',
      role: 'USER',
    },
  });
  console.log('Created Normal User 2:', user2.email);

  // 4. Create Sample Stores
  const store1 = await prisma.store.create({
    data: {
      name: 'Central Organic Grocery & Fresh Market',
      email: 'contact@freshmarket.local',
      address: '500 Market Square, Building A, Central City',
      ownerId: storeOwner.id,
    },
  });
  console.log('Created Store 1:', store1.name);

  // 5. Create Sample Ratings
  const rating1 = await prisma.rating.create({
    data: {
      userId: user1.id,
      storeId: store1.id,
      rating: 5,
    },
  });
  console.log('Created Rating from User 1:', rating1.rating);

  const rating2 = await prisma.rating.create({
    data: {
      userId: user2.id,
      storeId: store1.id,
      rating: 4,
    },
  });
  console.log('Created Rating from User 2:', rating2.rating);

  console.log('--- Database Seeding Completed Successfully ---');
  console.log('Default Credentials for Development:');
  console.log('  Admin:       admin@ratehub.local       / Password@123');
  console.log('  Store Owner: owner@ratehub.local       / Password@123');
  console.log('  Normal User: user1@ratehub.local       / Password@123');
  console.log('  Normal User: user2@ratehub.local       / Password@123');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
