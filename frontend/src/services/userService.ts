import api from './api';
import { Address, ApiResponse, User } from '@/types';

export const userService = {
  // Kullanıcı profil bilgilerini getir
  getUserProfile: async () => {
    const response = await api.get<ApiResponse<User>>('/users/profile');
    return response.data;
  },

  // Kullanıcı profil bilgilerini güncelle
  updateUserProfile: async (userData: Partial<User>) => {
    const response = await api.put<ApiResponse<User>>('/users/profile', userData);
    return response.data;
  },

  // Adres ekle
  addAddress: async (address: Omit<Address, '_id'>) => {
    const response = await api.post<ApiResponse<Address>>('/users/addresses', address);
    return response.data;
  },

  // Adres güncelle
  updateAddress: async (addressId: string, address: Omit<Address, '_id'>) => {
    const response = await api.put<ApiResponse<Address>>(`/users/addresses/${addressId}`, address);
    return response.data;
  },

  // Adres sil
  deleteAddress: async (addressId: string) => {
    const response = await api.delete<ApiResponse<{ message: string }>>(`/users/addresses/${addressId}`);
    return response.data;
  },

  // Favori kategorileri güncelle
  updateFavoriteCategories: async (categoryIds: string[]) => {
    const response = await api.put<ApiResponse<User>>('/users/favorite-categories', { categoryIds });
    return response.data;
  },
}; 