import api from './api';
import { ApiResponse, Category } from '@/types';

export const categoryService = {
  // Tüm kategorileri getir
  getCategories: async (params: any = {}) => {
    try {
      console.log('Fetching categories with params:', params);
      const response = await api.get<ApiResponse<Category[]>>('/categories', { params });
      console.log('Categories response:', response.data);
      
      // Backend'in döndürdüğü yanıt formatını frontend'in beklediği formata dönüştür
      if (response.data && response.data.categories) {
        return {
          success: response.data.success,
          message: response.data.message || '',
          data: response.data.categories
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { success: false, message: 'Kategoriler yüklenirken hata oluştu', data: [] };
    }
  },

  // ID ile kategori detayını getir
  getCategoryById: async (id: string) => {
    const response = await api.get<ApiResponse<Category>>(`/categories/${id}`);
    return response.data;
  },

  // Slug ile kategori detayını getir
  getCategoryBySlug: async (slug: string) => {
    const response = await api.get<ApiResponse<Category>>(`/categories/slug/${slug}`);
    return response.data;
  },

  // Admin: Kategori oluştur
  createCategory: async (categoryData: FormData) => {
    const response = await api.post<ApiResponse<Category>>('/categories', categoryData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Admin: Kategori güncelle
  updateCategory: async (id: string, categoryData: FormData) => {
    const response = await api.put<ApiResponse<Category>>(`/categories/${id}`, categoryData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Admin: Kategori sil
  deleteCategory: async (id: string) => {
    const response = await api.delete<ApiResponse<{ message: string }>>(`/categories/${id}`);
    return response.data;
  },
}; 