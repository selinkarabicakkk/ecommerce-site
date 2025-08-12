import api from './api';
import { ApiResponse, Cart, CartItem } from '@/types';

export const cartService = {
  // Kullanıcı sepetini getir
  getCart: async () => {
    const response = await api.get('/cart');
    // Backend { success, cart } döndürüyor. ApiResponse<Cart> ile uyumlu hale getiriyoruz
    const data: ApiResponse<Cart> = {
      success: Boolean(response.data?.success),
      message: '',
      data: response.data?.cart,
    };
    return data;
  },

  // Sepete ürün ekle
  addToCart: async (item: Omit<CartItem, '_id'>) => {
    // Backend body: { productId, quantity, variantOptions }
    const payload = {
      productId: typeof item.product === 'string' ? item.product : (item.product as any)?._id,
      quantity: item.quantity,
      variantOptions: item.variantOptions || {},
    };
    const response = await api.post('/cart', payload);
    const data: ApiResponse<Cart> = {
      success: Boolean(response.data?.success),
      message: '',
      data: response.data?.cart,
    };
    return data;
  },

  // Sepetteki ürünü güncelle
  updateCartItem: async (itemId: string, quantity: number) => {
    const response = await api.put(`/cart/${itemId}`, { quantity });
    const data: ApiResponse<Cart> = {
      success: Boolean(response.data?.success),
      message: '',
      data: response.data?.cart,
    };
    return data;
  },

  // Sepetten ürün sil
  removeCartItem: async (itemId: string) => {
    const response = await api.delete(`/cart/${itemId}`);
    const data: ApiResponse<Cart> = {
      success: Boolean(response.data?.success),
      message: '',
      data: response.data?.cart,
    };
    return data;
  },

  // Sepeti temizle
  clearCart: async () => {
    const response = await api.delete('/cart');
    const data: ApiResponse<{ message: string }> = {
      success: Boolean(response.data?.success),
      message: 'Cart cleared',
      data: { message: 'Cart cleared' },
    };
    return data;
  },
}; 