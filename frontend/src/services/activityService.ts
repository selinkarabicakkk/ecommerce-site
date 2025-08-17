import api from './api';
import { ApiResponse, Activity } from '@/types';

export const activityService = {
  // Kullanıcı etkinliği kaydet
  logActivity: async (data: {
    productId: string;
    activityType: 'view' | 'cart' | 'wishlist' | 'purchase';
  }) => {
    const response = await api.post<ApiResponse<Activity>>('/activities', data);
    return response.data;
  },

  // Kullanıcının etkinlik geçmişini getir
  getUserActivities: async () => {
    const response = await api.get<ApiResponse<Activity[]>>('/activities/user');
    return response.data;
  },

  // Popüler ürünleri getir
  getPopularProducts: async (limit: number = 8) => {
    const response = await api.get<ApiResponse<any>>(`/recommendations/popular?limit=${limit}`);
    const raw: any = response.data;
    if (raw && raw.products) {
      return { success: raw.success, data: raw.products } as ApiResponse<any>;
    }
    return raw;
  },

  // Kullanıcıya özel önerilen ürünleri getir
  getRecommendedProducts: async (limit: number = 8) => {
    const response = await api.get<ApiResponse<any>>(`/recommendations/history?limit=${limit}`);
    return response.data;
  },

  // Birlikte sıkça alınan ürünleri getir
  getFrequentlyBoughtTogether: async (productId: string, limit: number = 4) => {
    const response = await api.get<ApiResponse<any>>(
      `/recommendations/frequently-bought-together/${productId}?limit=${limit}`
    );
    return response.data;
  },
};