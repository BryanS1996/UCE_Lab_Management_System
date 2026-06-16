import { axiosInstance } from './axiosInstance';
import { LoginResponse } from '../types';

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>('/api/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  register: async (userData: Record<string, any>): Promise<any> => {
    const response = await axiosInstance.post('/api/auth/register', userData);
    return response.data;
  },

  getMe: async (): Promise<any> => {
    const response = await axiosInstance.get('/api/auth/me');
    return response.data;
  },
};
