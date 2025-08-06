import { z } from 'zod';

export const logActivitySchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  activityType: z.enum(['view', 'cart', 'wishlist'])
    .describe('Activity type must be view, cart, or wishlist'),
});

export type LogActivityInput = z.infer<typeof logActivitySchema>; 