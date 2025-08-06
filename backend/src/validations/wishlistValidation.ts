import { z } from 'zod';

export const wishlistValidation = {
  // İstek listesine ürün ekleme validasyonu
  addToWishlist: z.object({
    body: z.object({
      productId: z.string({
        required_error: 'Ürün ID\'si gereklidir',
        invalid_type_error: 'Ürün ID\'si string olmalıdır',
      }),
    }),
  }),
};