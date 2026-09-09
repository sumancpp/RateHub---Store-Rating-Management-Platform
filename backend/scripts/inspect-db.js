import { prisma } from '../src/config/prisma.js';

async function main() {
  console.log('\n================ RATEHUB DATABASE SNAPSHOT ================');

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      address: true,
      createdAt: true,
    },
  });

  console.log(`\n--- USERS (${users.length}) ---`);
  console.table(users);

  const stores = await prisma.store.findMany({
    include: {
      owner: { select: { name: true, email: true } },
      ratings: { select: { rating: true } },
    },
  });

  const formattedStores = stores.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    owner: s.owner.name,
    ratingsCount: s.ratings.length,
    averageRating:
      s.ratings.length > 0
        ? (s.ratings.reduce((a, b) => a + b.rating, 0) / s.ratings.length).toFixed(1)
        : 'N/A',
  }));

  console.log(`\n--- STORES (${stores.length}) ---`);
  console.table(formattedStores);

  const ratings = await prisma.rating.findMany({
    include: {
      user: { select: { name: true, email: true } },
      store: { select: { name: true } },
    },
  });

  const formattedRatings = ratings.map((r) => ({
    id: r.id,
    user: r.user.name,
    store: r.store.name,
    rating: `${r.rating} ★`,
    createdAt: r.createdAt.toISOString(),
  }));

  console.log(`\n--- RATINGS (${ratings.length}) ---`);
  console.table(formattedRatings);

  console.log('===========================================================\n');
}

main()
  .catch((e) => {
    console.error('Error inspecting database:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
