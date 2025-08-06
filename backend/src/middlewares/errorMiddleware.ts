import { Request, Response, NextFunction } from 'express';
import { ApiError, ValidationError } from '../utils/errorUtils';
import config from '../config/config';
import { ZodError } from 'zod';

/**
 * Error handler middleware
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = err;
  let statusCode = 500;
  let message = 'Server Error';
  let errors: Record<string, string> = {};

  // Handle known errors
  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
    if (error instanceof ValidationError) {
      errors = error.errors;
    }
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    statusCode = 422;
    message = 'Validation Error';
    
    // Zod v4+ API
    const formattedErrors = error.format();
    
    // Flatten error messages
    const flattenErrors = (obj: any, path: string = ''): Record<string, string> => {
      const result: Record<string, string> = {};
      
      for (const key in obj) {
        if (key === '_errors' && Array.isArray(obj[key]) && obj[key].length > 0) {
          result[path] = obj[key][0];
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          const newPath = path ? `${path}.${key}` : key;
          Object.assign(result, flattenErrors(obj[key], newPath));
        }
      }
      
      return result;
    };
    
    errors = flattenErrors(formattedErrors);
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError' && 'errors' in err) {
    statusCode = 422;
    message = 'Validation Error';
    const mongooseErrors = err.errors as Record<string, { message: string }>;
    
    Object.keys(mongooseErrors).forEach((key) => {
      errors[key] = mongooseErrors[key].message;
    });
  }

  // Handle Mongoose duplicate key error
  if ((err as any).code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value entered';
    const field = Object.keys((err as any).keyValue)[0];
    errors[field] = `${field} already exists`;
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
    stack: config.nodeEnv === 'production' ? undefined : err.stack,
  });
};

/**
 * Not found middleware - handles 404 errors
 */
export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};