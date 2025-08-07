import { z } from 'zod';

export const wishlistValidation = {
  // İstek listesine ürün ekleme validasyonu
  addToWishlist: z.object({
    body: z.object({
      productId: z.string().min(1, { message: 'Ürün ID\'si gereklidir' }),
    }),
  }),
};