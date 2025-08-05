import api from './api';
import { ApiResponse, Cart, CartItem } from '@/types';

export const cartService = {
  // Kullanıcı sepetini getir
  getCart: async () => {
    const response = await api.get<ApiResponse<Cart>>('/cart');
    return response.data;
  },

  // Sepete ürün ekle
  addToCart: async (item: Omit<CartItem, '_id'>) => {
    const response = await api.post<ApiResponse<Cart>>('/cart', item);
    return response.data;
  },

  // Sepetteki ürünü güncelle
  updateCartItem: async (itemId: string, quantity: number) => {
    const response = await api.put<ApiResponse<Cart>>(`/cart/${itemId}`, { quantity });
    return response.data;
  },

  // Sepetten ürün sil
  removeCartItem: async (itemId: string) => {
    const response = await api.delete<ApiResponse<Cart>>(`/cart/${itemId}`);
    return response.data;
  },

  // Sepeti temizle
  clearCart: async () => {
    const response = await api.delete<ApiResponse<{ message: string }>>('/cart');
    return response.data;
  },
}; 