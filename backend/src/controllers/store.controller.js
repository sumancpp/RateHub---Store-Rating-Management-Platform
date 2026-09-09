import { prisma } from '../config/prisma.js';
import { ratingSchema, storeQuerySchema } from '../validators/store.validator.js';

export async function getStores(req, res, next) {
  try {
    const query = storeQuerySchema.parse(req.query);

    const where = {};
    if (query.name) {
      where.name = { contains: query.name, mode: 'insensitive' };
    }
    if (query.address) {
      where.address = { contains: query.address, mode: 'insensitive' };
    }

    const currentUserId = req.user?.id || null;

    const stores = await prisma.store.findMany({
      where,
      include: {
        ratings: {
          select: {
            userId: true,
            rating: true,
          },
        },
      },
    });

    let formattedStores = stores.map((store) => {
      const count = store.ratings.length;
      const sum = store.ratings.reduce((acc, curr) => acc + curr.rating, 0);
      const overallRating = count > 0 ? Number((sum / count).toFixed(1)) : null;

      let myRating = null;
      if (currentUserId) {
        const userRatingRecord = store.ratings.find((r) => r.userId === currentUserId);
        if (userRatingRecord) {
          myRating = userRatingRecord.rating;
        }
      }

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        totalRatings: count,
        overallRating,
        myRating,
        createdAt: store.createdAt,
      };
    });

    // Whitelisted sort fields
    const sortBy = query.sortBy || 'name';
    const sortOrder = query.sortOrder === 'desc' ? 'desc' : 'asc';

    formattedStores.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === 'rating') {
        valA = a.overallRating ?? -1;
        valB = b.overallRating ?? -1;
      }

      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === 'string') {
        return sortOrder === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    res.status(200).json({
      status: 'success',
      results: formattedStores.length,
      data: { stores: formattedStores },
    });
  } catch (error) {
    next(error);
  }
}

export async function getStoreById(req, res, next) {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.id || null;

    const store = await prisma.store.findUnique({
      where: { id },
      include: {
        ratings: {
          select: {
            userId: true,
            rating: true,
          },
        },
      },
    });

    if (!store) {
      return res.status(404).json({
        status: 'fail',
        message: 'Store not found',
      });
    }

    const count = store.ratings.length;
    const sum = store.ratings.reduce((acc, curr) => acc + curr.rating, 0);
    const overallRating = count > 0 ? Number((sum / count).toFixed(1)) : null;

    let myRating = null;
    if (currentUserId) {
      const userRatingRecord = store.ratings.find((r) => r.userId === currentUserId);
      if (userRatingRecord) {
        myRating = userRatingRecord.rating;
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        store: {
          id: store.id,
          name: store.name,
          email: store.email,
          address: store.address,
          totalRatings: count,
          overallRating,
          myRating,
          createdAt: store.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function submitRating(req, res, next) {
  try {
    const { id: storeId } = req.params;
    const userId = req.user.id;

    const validatedBody = ratingSchema.parse(req.body);

    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      return res.status(404).json({
        status: 'fail',
        message: 'Store not found',
      });
    }

    const existingRating = await prisma.rating.findUnique({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
    });

    if (existingRating) {
      return res.status(409).json({
        status: 'fail',
        message: 'You have already rated this store. Please modify your existing rating instead.',
      });
    }

    const newRating = await prisma.rating.create({
      data: {
        userId,
        storeId,
        rating: validatedBody.rating,
      },
    });

    res.status(201).json({
      status: 'success',
      message: 'Rating submitted successfully',
      data: {
        rating: {
          id: newRating.id,
          storeId: newRating.storeId,
          rating: newRating.rating,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateRating(req, res, next) {
  try {
    const { id: storeId } = req.params;
    const userId = req.user.id;

    const validatedBody = ratingSchema.parse(req.body);

    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      return res.status(404).json({
        status: 'fail',
        message: 'Store not found',
      });
    }

    const existingRating = await prisma.rating.findUnique({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
    });

    if (!existingRating) {
      return res.status(404).json({
        status: 'fail',
        message: 'No existing rating found for this store to update. Please submit a new rating first.',
      });
    }

    const updatedRating = await prisma.rating.update({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
      data: {
        rating: validatedBody.rating,
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'Rating modified successfully',
      data: {
        rating: {
          id: updatedRating.id,
          storeId: updatedRating.storeId,
          rating: updatedRating.rating,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}
