import { axiosInstance } from './axiosInstance';

export interface Reservation {
  reservation_id: string;
  user_id: string;
  lab_id: number;
  start_time: string;
  end_time: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
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
  getMyReservations: async (): Promise<Reservation[]> => {
    const response = await axiosInstance.get<Reservation[]>('/api/reservations/my');
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

  cancel: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/reservations/${id}`);
  },
};
