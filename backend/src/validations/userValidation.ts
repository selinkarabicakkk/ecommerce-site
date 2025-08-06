import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .optional(),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .optional(),
  phoneNumber: z.string().optional(),
});

export const addressSchema = z.object({
  type: z.enum(['shipping', 'billing'])
    .describe('Type must be either shipping or billing'),
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'Zip code is required'),
  country: z.string().min(1, 'Country is required'),
  isDefault: z.boolean().optional().default(false),
});

export const updateAddressSchema = z.object({
  type: z.enum(['shipping', 'billing'])
    .describe('Type must be either shipping or billing')
    .optional(),
  street: z.string().min(1, 'Street is required').optional(),
  city: z.string().min(1, 'City is required').optional(),
  state: z.string().min(1, 'State is required').optional(),
  zipCode: z.string().min(1, 'Zip code is required').optional(),
  country: z.string().min(1, 'Country is required').optional(),
  isDefault: z.boolean().optional(),
});

export const favoritesCategoriesSchema = z.object({
  categoryIds: z.array(z.string()),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
export type FavoriteCategoriesInput = z.infer<typeof favoritesCategoriesSchema>;