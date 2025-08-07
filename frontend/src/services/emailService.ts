import api from './api';
import { ApiResponse } from '@/types';

export const emailService = {
  newsletter: async (email: string) => {
    const res = await api.post<ApiResponse<{ message: string }>>('/email/newsletter', { email });
    return res.data;
  },
  contact: async (name: string, email: string, message: string) => {
    const res = await api.post<ApiResponse<{ message: string }>>('/email/contact', { name, email, message });
    return res.data;
  },
};

export default emailService;


