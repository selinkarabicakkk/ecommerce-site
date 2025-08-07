import api from './api';
import { Address, ApiResponse, Order, PaginatedResponse } from '@/types';

interface CreateOrderData {
  orderItems: {
    product: string;
    quantity: number;
    variantOptions?: Record<string, string>;
  }[];
  shippingAddress: Address;
  paymentMethod: string;
}

interface PaymentResultData {
  id: string;
  status: string;
  updateTime: string;
  emailAddress?: string;
}

export const orderService = {
  // Sipariş oluştur
  createOrder: async (orderData: CreateOrderData) => {
    const response = await api.post<ApiResponse<Order>>('/orders', orderData);
    return response.data;
  },

  // Kullanıcının siparişlerini getir
  getMyOrders: async (page: number = 1, limit: number = 10) => {
    const response = await api.get<PaginatedResponse<Order>>(`/orders/myorders?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Sipariş detayını getir
  getOrderById: async (id: string) => {
    const response = await api.get<ApiResponse<Order>>(`/orders/${id}`);
    return response.data;
  },

  // Siparişi ödendi olarak işaretle
  updateOrderToPaid: async (id: string, paymentResult: PaymentResultData) => {
    const response = await api.put<ApiResponse<Order>>(`/orders/${id}/pay`, paymentResult);
    return response.data;
  },

  // Admin: Tüm siparişleri getir
  getOrders: async (page: number = 1, limit: number = 10) => {
    const response = await api.get<PaginatedResponse<Order>>(`/admin/orders?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Admin: Sipariş durumunu güncelle
  updateOrderStatus: async (id: string, status: Order['status']) => {
    const response = await api.put<ApiResponse<Order>>(`/orders/${id}/status`, { status });
    return response.data;
  },
}; 