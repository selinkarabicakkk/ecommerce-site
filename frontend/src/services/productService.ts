import api from './api';
import { ApiResponse, PaginatedResponse, Product, ProductFilters } from '@/types';

export const productService = {
  // Ürünleri getir (filtreleme, sıralama ve sayfalama ile)
  getProducts: async (filters: ProductFilters = {}) => {
    const queryParams = new URLSearchParams();
    
    // Filtreleri URL parametrelerine dönüştür
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.minPrice !== undefined) queryParams.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== undefined) queryParams.append('maxPrice', filters.maxPrice.toString());
    if (filters.rating !== undefined) queryParams.append('rating', filters.rating.toString());
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.sort) queryParams.append('sort', filters.sort);
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    if (filters.tags && filters.tags.length > 0) {
      filters.tags.forEach(tag => queryParams.append('tags', tag));
    }
    if (filters.featured !== undefined) queryParams.append('featured', filters.featured.toString());
    
    const queryString = queryParams.toString();
    const response = await api.get<PaginatedResponse<Product>>(`/products${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  // ID ile ürün detayını getir
  getProductById: async (id: string) => {
    const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data;
  },

  // Slug ile ürün detayını getir
  getProductBySlug: async (slug: string) => {
    const response = await api.get<ApiResponse<Product>>(`/products/slug/${slug}`);
    return response.data;
  },

  // En yüksek puanlı ürünleri getir
  getTopRatedProducts: async (limit: number = 5) => {
    const response = await api.get<ApiResponse<Product[]>>(`/products/top?limit=${limit}`);
    return response.data;
  },

  // Öne çıkan ürünleri getir
  getFeaturedProducts: async (limit: number = 8) => {
    try {
      console.log('Fetching featured products...');
      const response = await api.get<ApiResponse<Product[]>>(`/products/featured?limit=${limit}`);
      console.log('Featured products response:', response.data);
      
      // Backend'in döndürdüğü yanıt formatını frontend'in beklediği formata dönüştür
      if (response.data && response.data.products) {
        return {
          success: response.data.success,
          message: response.data.message || '',
          data: response.data.products
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return { success: false, message: 'Öne çıkan ürünler yüklenirken hata oluştu', data: [] };
    }
  },

  // Yeni gelen ürünleri getir
  getNewArrivals: async (limit: number = 8) => {
    const response = await api.get<ApiResponse<Product[]>>(`/products/new?limit=${limit}`);
    return response.data;
  },

  // İlgili ürünleri getir
  getRelatedProducts: async (productId: string, limit: number = 4) => {
    const response = await api.get<ApiResponse<Product[]>>(`/products/${productId}/related?limit=${limit}`);
    return response.data;
  },

  // Admin: Ürün oluştur
  createProduct: async (productData: FormData) => {
    const response = await api.post<ApiResponse<Product>>('/products', productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Admin: Ürün güncelle
  updateProduct: async (id: string, productData: FormData) => {
    const response = await api.put<ApiResponse<Product>>(`/products/${id}`, productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Admin: Ürün sil
  deleteProduct: async (id: string) => {
    const response = await api.delete<ApiResponse<{ message: string }>>(`/products/${id}`);
    return response.data;
  },
}; 