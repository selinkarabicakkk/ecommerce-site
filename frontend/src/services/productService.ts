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
    // Backend beklenen isim: keyword
    if (filters.search) queryParams.append('q', filters.search);
    // Backend beklenen isim ve değerler: sortBy = price_asc | price_desc | rating | newest
    if (filters.sort) {
      const sortMap: Record<NonNullable<ProductFilters['sort']>, string> = {
        price: 'price_asc',
        'price-desc': 'price_desc',
        rating: 'rating',
        newest: 'newest',
      };
      queryParams.append('sortBy', sortMap[filters.sort]);
    }
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    if (filters.tags && filters.tags.length > 0) {
      filters.tags.forEach(tag => queryParams.append('tags', tag));
    }
    if (filters.featured !== undefined) queryParams.append('featured', filters.featured.toString());
    
    const queryString = queryParams.toString();
    const response = await api.get<PaginatedResponse<Product> & { products?: Product[]; count?: number }>(
      `/search${queryString ? `?${queryString}` : ''}`
    );
    const data = response.data as any;
    if (data && Array.isArray(data.products)) {
      return {
        success: true,
        message: '',
        data: data.products as Product[],
        page: data.page ?? 1,
        pages: data.pages ?? 1,
        total: data.count ?? data.total ?? (data.products as Product[]).length,
      } as PaginatedResponse<Product>;
    }
    return response.data;
  },

  // ID ile ürün detayını getir
  getProductById: async (id: string) => {
    const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data;
  },

  // Slug ile ürün detayını getir
  getProductBySlug: async (slug: string) => {
    const response = await api.get(`/products/slug/${slug}`);
    // Backend { success, product } döndürüyor; frontend ApiResponse<Product> bekliyor
    const raw: any = response.data;
    if (raw && raw.product) {
      return {
        success: Boolean(raw.success),
        message: raw.message || '',
        data: raw.product as Product,
      } as ApiResponse<Product>;
    }
    return raw as ApiResponse<Product>;
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
    const response = await api.get<ApiResponse<Product[]>>(`/recommendations/related/${productId}?limit=${limit}`);
    return response.data;
  },

  // Admin: Ürün oluştur (JSON)
  createProduct: async (productData: Partial<Product> & { images: string[] }) => {
    const response = await api.post<ApiResponse<Product>>('/admin/products', productData);
    return response.data;
  },

  // Admin: Ürün güncelle (JSON)
  updateProduct: async (id: string, productData: Partial<Product> & { images?: string[] }) => {
    const response = await api.put<ApiResponse<Product>>(`/admin/products/${id}`, productData);
    return response.data;
  },

  // Admin: Ürün sil
  deleteProduct: async (id: string) => {
    const response = await api.delete<ApiResponse<{ message: string }>>(`/admin/products/${id}`);
    return response.data;
  },

  // Admin: Toplu güncelle (aktif/pasif, öne çıkar/çıkarma)
  bulkUpdateProducts: async (items: Array<{ id: string; isActive?: boolean; isFeatured?: boolean }>) => {
    const response = await api.patch<ApiResponse<any>>('/admin/products/bulk', { items });
    return response.data;
  },
}; 