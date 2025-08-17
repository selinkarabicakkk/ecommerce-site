import api from './api';
import { ApiResponse, Category } from '@/types';

export const categoryService = {
  // Tüm kategorileri getir
  getCategories: async (params: any = {}) => {
    try {
      console.log('Fetching categories with params:', params);
      const response = await api.get<ApiResponse<Category[]>>('/categories', { params });
      console.log('Categories response:', response.data);

      // Backend yanıtı: { success, count, categories }
      // Bazı durumlarda { success, data: [...], count } da olabilir
      const raw: any = response.data;
      if (raw) {
        const categories = raw.categories || raw.data || [];
        const totalCount = raw.count ?? categories.length;
        return { success: Boolean(raw.success), categories, totalCount } as unknown as ApiResponse<Category[]> & { categories: Category[]; totalCount: number };
      }

      return { success: false, categories: [], totalCount: 0 } as any;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { success: false, categories: [], totalCount: 0 } as any;
    }
  },

  // ID ile kategori detayını getir
  getCategoryById: async (id: string) => {
    const response = await api.get<ApiResponse<Category>>(`/categories/${id}`);
    return response.data;
  },

  // Slug ile kategori detayını getir
  getCategoryBySlug: async (slug: string) => {
    const response = await api.get(`/categories/slug/${slug}`);
    const raw: any = response.data;
    if (raw && raw.category) {
      return {
        success: Boolean(raw.success),
        message: raw.message || '',
        data: raw.category as Category,
      } as ApiResponse<Category>;
    }
    return raw as ApiResponse<Category>;
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