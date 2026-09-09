import { z } from 'zod';

const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/;

export const passwordSchema = z
  .string({ required_error: 'Password is required' })
  .min(8, { message: 'Password must be at least 8 characters' })
  .max(16, { message: 'Password must be at most 16 characters' })
  .refine((val) => /[A-Z]/.test(val), {
    message: 'Password must contain at least one uppercase letter',
  })
  .refine((val) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(val), {
    message: 'Password must contain at least one special character',
  });

export const nameSchema = z
  .string({ required_error: 'Name is required' })
  .trim()
  .min(20, { message: 'Name must be at least 20 characters' })
  .max(60, { message: 'Name must be at most 60 characters' });

export const addressSchema = z
  .string({ required_error: 'Address is required' })
  .trim()
  .min(1, { message: 'Address is required' })
  .max(400, { message: 'Address must be at most 400 characters' });

export const emailSchema = z
  .string({ required_error: 'Email is required' })
  .trim()
  .toLowerCase()
  .email({ message: 'Must be a valid email address' });

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  address: addressSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string({ required_error: 'Password is required' }).min(1, { message: 'Password is required' }),
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string({ required_error: 'Current password is required' })
    .min(1, { message: 'Current password is required' }),
  newPassword: passwordSchema,
});
