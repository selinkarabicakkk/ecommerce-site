import { z } from 'zod';

export const createReviewSchema = z.object({
  product: z.string().min(1, 'Product ID is required'),
  rating: z
    .number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  comment: z
    .string()
    .min(1, 'Comment is required')
    .max(500, 'Comment must be less than 500 characters'),
});

export const updateReviewSchema = z.object({
  rating: z
    .number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5')
    .optional(),
  comment: z
    .string()
    .min(1, 'Comment is required')
    .max(500, 'Comment must be less than 500 characters')
    .optional(),
  isApproved: z.boolean().optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>; 