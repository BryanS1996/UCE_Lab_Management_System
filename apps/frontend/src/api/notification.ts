import { axiosInstance } from './axiosInstance';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export const notificationApi = {
  getNotifications: async (): Promise<Notification[]> => {
    const response = await axiosInstance.get<Notification[]>('/api/notifications');
    return response.data;
  },

  getUnreadCount: async (): Promise<{ count: number }> => {
    const response = await axiosInstance.get<{ count: number }>('/api/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (id: string): Promise<Notification> => {
    const response = await axiosInstance.patch<Notification>(`/api/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<void> => {
    await axiosInstance.patch('/api/notifications/read-all');
  },
};
