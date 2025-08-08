import api from './api';

export interface WishlistItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    image?: string;
    slug: string;
  };
  user: string;
  createdAt: string;
}

export interface WishlistResponse {
  data: WishlistItem[];
  totalCount: number;
}

const wishlistService = {
  // Kullanıcının istek listesini getir
  getWishlist: async (): Promise<WishlistResponse> => {
    const response = await api.get('/user/wishlist');
    return response.data;
  },

  // Ürünü istek listesine ekle
  addToWishlist: async (productId: string): Promise<{ message: string }> => {
    const response = await api.post('/user/wishlist', { productId });
    return response.data;
  },

  // Ürünü istek listesinden çıkar
  removeFromWishlist: async (itemId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/user/wishlist/${itemId}`);
    return response.data;
  },

  // Ürünün istek listesinde olup olmadığını kontrol et
  checkInWishlist: async (productId: string): Promise<{ inWishlist: boolean; itemId?: string }> => {
    const response = await api.get(`/user/wishlist/check/${productId}`);
    return response.data;
  },

  // İstek listesini temizle
  clearWishlist: async (): Promise<{ message: string }> => {
    const response = await api.delete('/user/wishlist');
    return response.data;
  },
};

export default wishlistService;