import { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  statusCode?: number;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

/**
 * Simple in-memory rate limiter middleware
 * @param options Rate limit options
 */
export const rateLimit = (options: RateLimitOptions) => {
  const {
    windowMs = 60 * 1000, // 1 minute
    max = 100, // 100 requests per windowMs
    message = 'Too many requests, please try again later',
    statusCode = 429,
  } = options;

  const store: RateLimitStore = {};

  // Clean up expired entries every 5 minutes
  setInterval(() => {
    const now = Date.now();
    Object.keys(store).forEach((key) => {
      if (store[key].resetTime <= now) {
        delete store[key];
      }
    });
  }, 5 * 60 * 1000);

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip || 'unknown';
    const now = Date.now();

    // Initialize or reset if expired
    if (!store[key] || store[key].resetTime <= now) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return next();
    }

    // Increment count
    store[key].count += 1;

    // Check if over limit
    if (store[key].count > max) {
      return res.status(statusCode).json({
        success: false,
        message,
      });
    }

    next();
  };
}; 