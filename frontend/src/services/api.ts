import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

// API URL'ini ortam değişkeninden alıyoruz, yoksa varsayılan olarak localhost:5000 kullanıyoruz
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
console.log('API URL:', API_URL);

// Axios instance oluşturuyoruz
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - her istekte token varsa header'a ekliyor
api.interceptors.request.use(
  (config) => {
    // Client-side'da olduğumuzu kontrol ediyoruz
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - hata durumlarını ele alıyor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // 401 hatası ve token yenileme mekanizması
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // Oturumu otomatik sonlandırma yerine, isteği reddediyoruz.
      // Yönlendirme ve logout sayfa/flow bazında yapılacak.
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

export default api; 