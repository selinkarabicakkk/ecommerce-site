import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwtUtils';
import { UnauthorizedError, ForbiddenError } from '../utils/errorUtils';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

/**
 * Middleware to protect routes - verifies JWT token
 */
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token;

    // Check if token exists in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.jwt) {
      // Or check if token exists in cookies
      token = req.cookies.jwt;
    }

    if (!token) {
      throw new UnauthorizedError('Not authorized, no token');
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      throw new UnauthorizedError('Not authorized, invalid token');
    }

    // Set user in request object
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to restrict routes to specific roles
 * @param roles Array of allowed roles
 */
export const restrictTo = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('Not authorized'));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new ForbiddenError('Not authorized to access this resource'));
      return;
    }

    next();
  };
}; 