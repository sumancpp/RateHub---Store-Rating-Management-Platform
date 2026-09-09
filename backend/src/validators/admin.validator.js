import { z } from 'zod';
import { nameSchema, emailSchema, addressSchema, passwordSchema } from './auth.validator.js';

export const adminCreateUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  address: addressSchema,
  role: z.enum(['ADMIN', 'USER', 'STORE_OWNER'], {
    errorMap: () => ({ message: 'Role must be ADMIN, USER, or STORE_OWNER' }),
  }),
});

export const adminCreateStoreSchema = z.object({
  name: z
    .string({ required_error: 'Store name is required' })
    .trim()
    .min(3, { message: 'Store name must be at least 3 characters' })
    .max(100, { message: 'Store name must be at most 100 characters' }),
  email: emailSchema,
  address: addressSchema,
  ownerId: z.string({ required_error: 'Owner ID is required' }).uuid({ message: 'Valid Owner UUID is required' }),
});
