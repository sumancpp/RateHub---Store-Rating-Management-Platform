import { z } from 'zod';

export const ratingSchema = z.object({
  rating: z
    .number({
      required_error: 'Rating is required',
      invalid_type_error: 'Rating must be a valid number',
    })
    .int({ message: 'Rating must be an integer' })
    .min(1, { message: 'Rating must be at least 1' })
    .max(5, { message: 'Rating must be at most 5' }),
});

export const storeQuerySchema = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
  sortBy: z.enum(['name', 'email', 'address', 'rating', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const userQuerySchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(['ADMIN', 'USER', 'STORE_OWNER']).optional(),
  sortBy: z.enum(['name', 'email', 'address', 'role', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const storeOwnerRatingQuerySchema = z.object({
  sortBy: z.enum(['name', 'email', 'address', 'rating', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
