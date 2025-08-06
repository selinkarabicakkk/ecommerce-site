import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(50, 'Category name must be less than 50 characters'),
  description: z
    .string()
    .min(1, 'Category description is required')
    .max(500, 'Category description must be less than 500 characters'),
  image: z.string().min(1, 'Category image is required'),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(50, 'Category name must be less than 50 characters')
    .optional(),
  description: z
    .string()
    .min(1, 'Category description is required')
    .max(500, 'Category description must be less than 500 characters')
    .optional(),
  image: z.string().min(1, 'Category image is required').optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>; 