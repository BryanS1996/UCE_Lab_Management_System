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

  updateRole: async (userId: string, role: string) => {
    const response = await axiosInstance.patch(\/api/users/\/role\, { role });
    return response.data;
  },

  updateStatus: async (userId: string, isActive: boolean) => {
    const response = await axiosInstance.patch(\/api/users/\/status\, { isActive });
    return response.data;
  },
};

