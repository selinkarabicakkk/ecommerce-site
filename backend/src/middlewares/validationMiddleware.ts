import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ValidationError } from '../utils/errorUtils';

/**
 * Middleware for validating request data with Zod schemas
 * @param schema Zod schema to validate against
 * @param source Where to look for data to validate ('body', 'query', 'params')
 */
export const validate = (
  schema: AnyZodObject,
  source: 'body' | 'query' | 'params' = 'body'
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req[source];
      await schema.parseAsync(data);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string> = {};
        
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          errors[path] = err.message;
        });
        
        next(new ValidationError('Validation failed', errors));
      } else {
        next(error);
      }
    }
  };
}; 