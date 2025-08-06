import api from './api';
import { ApiResponse, PaginatedResponse, Review } from '@/types';

interface CreateReviewData {
  product: string;
  rating: number;
  comment: string;
}

export const reviewService = {
  // Ürün incelemelerini getir
  getReviewsByProduct: async (productId: string, page: number = 1, limit: number = 10) => {
    const response = await api.get<PaginatedResponse<Review>>(
      `/reviews/product/${productId}?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // İnceleme oluştur
  createReview: async (reviewData: CreateReviewData) => {
    const response = await api.post<ApiResponse<Review>>('/reviews', reviewData);
    return response.data;
  },

  // İnceleme güncelle
  updateReview: async (id: string, reviewData: Partial<CreateReviewData>) => {
    const response = await api.put<ApiResponse<Review>>(`/reviews/${id}`, reviewData);
    return response.data;
  },

  // İnceleme sil
  deleteReview: async (id: string) => {
    const response = await api.delete<ApiResponse<{ message: string }>>(`/reviews/${id}`);
    return response.data;
  },

  // Admin: Tüm incelemeleri getir
  getReviews: async (page: number = 1, limit: number = 10) => {
    const response = await api.get<PaginatedResponse<Review>>(`/reviews?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Admin: İncelemeyi onayla
  approveReview: async (id: string) => {
    const response = await api.put<ApiResponse<Review>>(`/reviews/${id}/approve`);
    return response.data;
  },
}; 