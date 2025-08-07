import { z } from 'zod';

// Product variant option schema
const productVariantOptionSchema = z.object({
  value: z.string().min(1, 'Option value is required'),
  price: z.number().min(0, 'Price cannot be negative'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  sku: z.string().min(1, 'SKU is required'),
});

// Product variant schema
const productVariantSchema = z.object({
  name: z.string().min(1, 'Variant name is required'),
  options: z.array(productVariantOptionSchema).min(1, 'At least one option is required'),
});

// Create product schema
export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, 'Product name is required')
    .max(100, 'Product name must be less than 100 characters'),
  description: z
    .string()
    .min(1, 'Product description is required')
    .max(2000, 'Product description must be less than 2000 characters'),
  price: z.number().min(0, 'Price cannot be negative'),
  category: z.string().min(1, 'Category is required'),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  specifications: z
    .record(z.string(), z.string())
    .optional()
    .default({}),
  tags: z.array(z.string()).optional().default([]),
  isFeatured: z.boolean().optional().default(false),
  variants: z.array(productVariantSchema).optional().default([]),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  sku: z.string().min(1, 'SKU is required'),
});

// Update product schema
export const updateProductSchema = z.object({
  name: z
    .string()
    .min(1, 'Product name is required')
    .max(100, 'Product name must be less than 100 characters')
    .optional(),
  description: z
    .string()
    .min(1, 'Product description is required')
    .max(2000, 'Product description must be less than 2000 characters')
    .optional(),
  price: z.number().min(0, 'Price cannot be negative').optional(),
  category: z.string().min(1, 'Category is required').optional(),
  images: z.array(z.string()).min(1, 'At least one image is required').optional(),
  specifications: z.record(z.string(), z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  variants: z.array(productVariantSchema).optional(),
  stock: z.number().int().min(0, 'Stock cannot be negative').optional(),
  sku: z.string().min(1, 'SKU is required').optional(),
});

// Bulk update products schema (active/featured)
export const bulkUpdateProductsSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1, 'Product ID is required'),
        isActive: z.boolean().optional(),
        isFeatured: z.boolean().optional(),
      })
    )
    .min(1, 'At least one item is required'),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>; 
export type BulkUpdateProductsInput = z.infer<typeof bulkUpdateProductsSchema>;