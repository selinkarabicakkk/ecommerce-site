import { z } from 'zod';

// Order item schema
const orderItemSchema = z.object({
  product: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  variantOptions: z.record(z.string()).optional(),
});

// Shipping address schema
const shippingAddressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'Zip code is required'),
  country: z.string().min(1, 'Country is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
});

// Create order schema
export const createOrderSchema = z.object({
  orderItems: z.array(orderItemSchema).min(1, 'At least one item is required'),
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.string().min(1, 'Payment method is required'),
});

// Payment result schema
const paymentResultSchema = z.object({
  id: z.string().min(1, 'Payment ID is required'),
  status: z.string().min(1, 'Payment status is required'),
  updateTime: z.string().min(1, 'Update time is required'),
  emailAddress: z.string().email('Invalid email address'),
});

// Update order to paid schema
export const updateOrderToPaidSchema = z.object({
  id: z.string().min(1, 'Payment ID is required'),
  status: z.string().min(1, 'Payment status is required'),
  updateTime: z.string().min(1, 'Update time is required'),
  emailAddress: z.string().email('Invalid email address'),
});

// Update order status schema
export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'], {
    required_error: 'Status is required',
    invalid_type_error: 'Invalid status',
  }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderToPaidInput = z.infer<typeof updateOrderToPaidSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>; 