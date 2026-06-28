import { axiosInstance } from './axiosInstance';

export interface Reservation {
  reservation_id: string;
  user_id: string;
  lab_id: number;
  start_time: string;
  end_time: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'PENDING_PAYMENT';
  purpose?: string;
  notes?: string;
  requires_payment: boolean;
  created_at: string;
  updated_at: string;
  // Relaciones pobladas por el microservicio si existen
  laboratory?: {
    name: string;
    location: string;
  };
}

export const reservationApi = {
  getAllReservations: async (params?: Record<string, any>): Promise<Reservation[]> => {
    const response = await axiosInstance.get<Reservation[]>('/api/reservations', { params });
    return response.data;
  },

  getMyReservations: async (): Promise<Reservation[]> => {
    const response = await axiosInstance.get<Reservation[]>('/api/reservations/my');
    return response.data;
  },

  getAdminStats: async (): Promise<any> => {
    const response = await axiosInstance.get<any>('/api/reservations/admin/stats');
    return response.data;
  },

  getReservation: async (id: string): Promise<Reservation> => {
    const response = await axiosInstance.get<Reservation>(`/api/reservations/${id}`);
    return response.data;
  },

  create: async (data: {
    lab_id: number;
    start_time: string;
    end_time: string;
    purpose?: string;
    notes?: string;
  }): Promise<Reservation> => {
    const response = await axiosInstance.post<Reservation>('/api/reservations', data);
    return response.data;
  },

  update: async (id: string, data: Record<string, any>): Promise<Reservation> => {
    const response = await axiosInstance.patch<Reservation>(`/api/reservations/${id}`, data);
    return response.data;
  },

  confirm: async (id: string): Promise<Reservation> => {
    const response = await axiosInstance.patch<Reservation>(`/api/reservations/${id}/confirm`);
    return response.data;
  },

  reject: async (id: string): Promise<Reservation> => {
    const response = await axiosInstance.patch<Reservation>(`/api/reservations/${id}/reject`);
    return response.data;
  },

  cancel: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/reservations/${id}`);
  },
};
