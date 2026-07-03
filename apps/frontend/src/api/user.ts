import { axiosInstance } from './axiosInstance';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  roles?: { name: string }[];
}

export const userApi = {
  getUsers: async (): Promise<User[]> => {
    const response = await axiosInstance.get('/api/users');
    return response.data;
  },

  createUser: async (userData: any) => {
    const response = await axiosInstance.post('/api/users', userData);
    return response.data;
  },

  updateRole: async (userId: string, role: string) => {
    const response = await axiosInstance.patch(`/api/users/${userId}/role`, { role });
    return response.data;
  },

  updateStatus: async (userId: string, isActive: boolean) => {
    const response = await axiosInstance.patch(`/api/users/${userId}/status`, { isActive });
    return response.data;
  },

  deleteUser: async (userId: string) => {
    const response = await axiosInstance.delete(`/api/users/${userId}`);
    return response.data;
  },
};

