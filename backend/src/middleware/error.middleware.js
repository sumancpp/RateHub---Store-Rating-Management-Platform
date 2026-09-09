import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { config } from '../config/env.js';

export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

export function errorHandler(err, req, res, next) {
  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(400).json({
      status: 'fail',
      message: formattedErrors[0]?.message || 'Validation failed',
      errors: formattedErrors,
    });
  }

  // Handle Prisma Known Request Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = err.meta?.target ? Array.isArray(err.meta.target) ? err.meta.target.join(', ') : err.meta.target : 'field';
      return res.status(409).json({
        status: 'fail',
        message: `A record with this ${target} already exists`,
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        status: 'fail',
        message: 'Requested record not found',
      });
    }
  }

  // Handle Operational App Errors
  if (err.isOperational) {
    return res.status(err.statusCode || 400).json({
      status: 'fail',
      message: err.message,
    });
  }

  // Unexpected / System Errors
  console.error('[RateHub Server Error]', err);

  const response = {
    status: 'error',
    message: 'An internal server error occurred. Please try again later.',
  };

  // Only expose details in non-production environments when debugging
  if (!config.isProduction && process.env.NODE_ENV !== 'test') {
    response.debugMessage = err.message;
  }

  return res.status(500).json(response);
}
