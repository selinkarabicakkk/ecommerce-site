import api from './api';
import { ApiResponse, Category } from '@/types';

export const categoryService = {
  // Tüm kategorileri getir
  getCategories: async () => {
    const response = await api.get<ApiResponse<Category[]>>('/categories');
    return response.data;
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