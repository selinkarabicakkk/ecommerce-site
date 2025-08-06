import api from './api';
import { ApiResponse, LoginCredentials, RegisterData, User } from '@/types';

interface AuthResponse extends ApiResponse<{ user: User; token: string }> {}

export const authService = {
  // Kullanıcı girişi
  login: async (credentials: LoginCredentials) => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  // Kullanıcı kaydı
  register: async (userData: RegisterData) => {
    const response = await api.post<ApiResponse<{ message: string }>>('/auth/register', userData);
    return response.data;
  },

  // Email doğrulama
  verifyEmail: async (token: string, email: string) => {
    const response = await api.get<ApiResponse<{ message: string }>>(
      `/auth/verify-email?token=${token}&email=${email}`
    );
    return response.data;
  },

  // Şifremi unuttum
  forgotPassword: async (email: string) => {
    const response = await api.post<ApiResponse<{ message: string }>>('/auth/forgot-password', { email });
    return response.data;
  },

  // Şifre sıfırlama
  resetPassword: async (token: string, email: string, password: string) => {
    const response = await api.post<ApiResponse<{ message: string }>>('/auth/reset-password', {
      token,
      email,
      password,
    });
    return response.data;
  },

  // Mevcut kullanıcı bilgisini alma
  getCurrentUser: async () => {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },

  // Çıkış yapma (client-side)
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
}; 