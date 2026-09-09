import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { adminCreateUserSchema, adminCreateStoreSchema } from '../validators/admin.validator.js';
import { userQuerySchema, storeQuerySchema } from '../validators/store.validator.js';

export async function getDashboardStats(req, res, next) {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.rating.count(),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalUsers,
        totalStores,
        totalRatings,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getUsers(req, res, next) {
  try {
    const query = userQuerySchema.parse(req.query);

    const where = {};
    if (query.name) {
      where.name = { contains: query.name, mode: 'insensitive' };
    }
    if (query.email) {
      where.email = { contains: query.email, mode: 'insensitive' };
    }
    if (query.address) {
      where.address = { contains: query.address, mode: 'insensitive' };
    }
    if (query.role) {
      where.role = query.role;
    }

    const allowedSortFields = ['name', 'email', 'address', 'role', 'createdAt'];
    const sortBy = allowedSortFields.includes(query.sortBy) ? query.sortBy : 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    const users = await prisma.user.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: { users },
    });
  } catch (error) {
    next(error);
  }
}

export async function getUserById(req, res, next) {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        storesOwned: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true,
            ratings: {
              select: { rating: true },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    let storeRating = null;
    let storeDetails = null;

    if (user.role === 'STORE_OWNER' && user.storesOwned.length > 0) {
      const store = user.storesOwned[0];
      const ratings = store.ratings;
      const avg = ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : null;

      storeRating = avg !== null ? Number(avg.toFixed(1)) : null;
      storeDetails = {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        totalRatings: ratings.length,
        averageRating: storeRating,
      };
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          address: user.address,
          role: user.role,
          createdAt: user.createdAt,
          store: storeDetails,
          storeRating,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function createUser(req, res, next) {
  try {
    const validatedData = adminCreateUserSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return res.status(409).json({
        status: 'fail',
        message: 'A user with this email already exists',
      });
    }

    const passwordHash = await bcrypt.hash(validatedData.password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        passwordHash,
        address: validatedData.address,
        role: validatedData.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      status: 'success',
      data: { user: newUser },
    });
  } catch (error) {
    next(error);
  }
}

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

    const stores = await prisma.store.findMany({
      where,
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        ratings: {
          select: { rating: true },
        },
      },
    });

    // Compute average ratings and format
    let formattedStores = stores.map((store) => {
      const count = store.ratings.length;
      const sum = store.ratings.reduce((acc, curr) => acc + curr.rating, 0);
      const overallRating = count > 0 ? Number((sum / count).toFixed(1)) : null;

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        owner: store.owner,
        totalRatings: count,
        overallRating,
        createdAt: store.createdAt,
      };
    });

    // Whitelisted sort fields
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

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

export async function createStore(req, res, next) {
  try {
    const validatedData = adminCreateStoreSchema.parse(req.body);

    const owner = await prisma.user.findUnique({
      where: { id: validatedData.ownerId },
    });

    if (!owner) {
      return res.status(404).json({
        status: 'fail',
        message: 'Designated store owner not found',
      });
    }

    if (owner.role !== 'STORE_OWNER') {
      return res.status(400).json({
        status: 'fail',
        message: 'The selected user must have the STORE_OWNER role',
      });
    }

    const newStore = await prisma.store.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        address: validatedData.address,
        ownerId: validatedData.ownerId,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.status(201).json({
      status: 'success',
      data: {
        store: {
          id: newStore.id,
          name: newStore.name,
          email: newStore.email,
          address: newStore.address,
          owner: newStore.owner,
          overallRating: null,
          totalRatings: 0,
          createdAt: newStore.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}
