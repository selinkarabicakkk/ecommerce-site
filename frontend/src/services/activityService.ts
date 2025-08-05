import api from './api';
import { Activity, ApiResponse, Product } from '@/types';

interface LogActivityData {
  product: string;
  activityType: 'view' | 'cart' | 'wishlist' | 'purchase';
}

export const activityService = {
  // Kullanıcı aktivitesini kaydet
  logActivity: async (activityData: LogActivityData) => {
    const response = await api.post<ApiResponse<Activity>>('/activity', activityData);
    return response.data;
  },

  // Popüler ürünleri getir
  getPopularProducts: async (limit: number = 8) => {
    const response = await api.get<ApiResponse<Product[]>>(`/activity/popular?limit=${limit}`);
    return response.data;
  },

  // Kullanıcıya özel öneriler getir
  getRecommendations: async (limit: number = 8) => {
    const response = await api.get<ApiResponse<Product[]>>(`/activity/recommendations?limit=${limit}`);
    return response.data;
  },

  // Birlikte sıkça alınan ürünleri getir
  getFrequentlyBoughtTogether: async (productId: string, limit: number = 4) => {
    const response = await api.get<ApiResponse<Product[]>>(
      `/activity/frequently-bought-together/${productId}?limit=${limit}`
    );
    return response.data;
  },
}; 