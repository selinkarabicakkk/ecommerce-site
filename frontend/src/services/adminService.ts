import api from './api';
import { ApiResponse, Order, User, Product } from '@/types';

export const adminService = {
  // İstatistikler
  getStats: async () => {
    const res = await api.get<ApiResponse<any>>('/admin/stats');
    return res.data;
  },
  // En popüler ürünler
  getPopularProducts: async (limit = 10) => {
    const res = await api.get<ApiResponse<Product[]>>(`/admin/popular-products?limit=${limit}`);
    return res.data;
  },
  // Satış grafiği
  getSalesGraph: async (days = 30) => {
    const res = await api.get<ApiResponse<any>>(`/admin/sales-graph?days=${days}`);
    return res.data;
  },
  // Müşteriler
  getCustomers: async () => {
    const res = await api.get<ApiResponse<User[]>>('/admin/customers');
    return res.data;
  },
  getCustomerById: async (id: string) => {
    const res = await api.get<ApiResponse<User>>(`/admin/customers/${id}`);
    return res.data;
  },
};

export default adminService;


