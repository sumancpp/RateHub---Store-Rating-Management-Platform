import { prisma } from '../config/prisma.js';
import { storeOwnerRatingQuerySchema } from '../validators/store.validator.js';

export async function getStoreOwnerDashboard(req, res, next) {
  try {
    const ownerId = req.user.id;

    // Derived strictly from authenticated user ID
    const store = await prisma.store.findFirst({
      where: { ownerId },
      include: {
        ratings: {
          select: { rating: true },
        },
      },
    });

    if (!store) {
      return res.status(200).json({
        status: 'success',
        data: {
          hasStore: false,
          store: null,
          averageRating: null,
          totalRatings: 0,
          displayRating: 'No store registered yet',
        },
      });
    }

    const count = store.ratings.length;
    const sum = store.ratings.reduce((acc, curr) => acc + curr.rating, 0);
    const avg = count > 0 ? Number((sum / count).toFixed(1)) : null;

    res.status(200).json({
      status: 'success',
      data: {
        hasStore: true,
        store: {
          id: store.id,
          name: store.name,
          email: store.email,
          address: store.address,
        },
        averageRating: avg,
        totalRatings: count,
        displayRating: avg !== null ? avg : 'No ratings yet',
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getStoreRatings(req, res, next) {
  try {
    const ownerId = req.user.id;
    const query = storeOwnerRatingQuerySchema.parse(req.query);

    // Derive store from authenticated owner
    const store = await prisma.store.findFirst({
      where: { ownerId },
    });

    if (!store) {
      return res.status(200).json({
        status: 'success',
        results: 0,
        data: { ratings: [] },
      });
    }

    const ratings = await prisma.rating.findMany({
      where: { storeId: store.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true,
          },
        },
      },
    });

    let formattedRatings = ratings.map((r) => ({
      id: r.id,
      rating: r.rating,
      createdAt: r.createdAt,
      user: {
        id: r.user.id,
        name: r.user.name,
        email: r.user.email,
        address: r.user.address,
      },
    }));

    // Whitelisted sort fields: name, email, rating, createdAt
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    formattedRatings.sort((a, b) => {
      let valA, valB;
      if (sortBy === 'name') {
        valA = a.user.name;
        valB = b.user.name;
      } else if (sortBy === 'email') {
        valA = a.user.email;
        valB = b.user.email;
      } else if (sortBy === 'address') {
        valA = a.user.address;
        valB = b.user.address;
      } else if (sortBy === 'rating') {
        valA = a.rating;
        valB = b.rating;
      } else {
        valA = a.createdAt;
        valB = b.createdAt;
      }

      if (typeof valA === 'string') {
        return sortOrder === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    res.status(200).json({
      status: 'success',
      results: formattedRatings.length,
      data: { ratings: formattedRatings },
    });
  } catch (error) {
    next(error);
  }
}
