import api from './api';
import { ApiResponse } from '@/types';

export const uploadService = {
  uploadImage: async (file: File) => {
    const form = new FormData();
    form.append('image', file);
    const res = await api.post<ApiResponse<{ filename: string; path: string }>>('/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};

export default uploadService;


