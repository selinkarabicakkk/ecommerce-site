import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodType } from 'zod';
import { ValidationError } from '../utils/errorUtils';

/**
 * Middleware for validating request data with Zod schemas
 * @param schema Zod schema to validate against
 * @param source Where to look for data to validate ('body', 'query', 'params')
 */
export const validate = (
  schema: ZodType<any>,
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
        
        // Zod v4+ API değişikliği
        const formattedErrors = error.format();
        
        // Hata mesajlarını düzleştir
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
        
        next(new ValidationError('Validation failed', flattenErrors(formattedErrors)));
      } else {
        next(error);
      }
    }
  };
}; 