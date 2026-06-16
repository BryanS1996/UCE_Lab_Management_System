import { axiosInstance } from './axiosInstance';

export interface LaboratoryResource {
  resource_id: number;
  name: string;
  type: 'COMPUTER' | 'PROJECTOR' | 'WHITEBOARD' | 'EQUIPMENT' | 'SOFTWARE' | 'OTHER';
  description?: string;
  quantity: number;
  is_available: boolean;
}

export interface Laboratory {
  lab_id: number;
  name: string;
  description?: string;
  location?: string;
  max_capacity: number;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  is_active: boolean;
  resources?: LaboratoryResource[];
}

export interface LaboratoryStats {
  total: number;
  active: number;
  inactive: number;
  maintenance: number;
  active_resources: number;
}

export const laboratoryApi = {
  getLaboratories: async (params?: Record<string, any>): Promise<Laboratory[]> => {
    const response = await axiosInstance.get<Laboratory[]>('/api/laboratories', { params });
    return response.data;
  },

  getLaboratory: async (labId: number): Promise<Laboratory> => {
    const response = await axiosInstance.get<Laboratory>(`/api/laboratories/${labId}`);
    return response.data;
  },

  getStats: async (): Promise<LaboratoryStats> => {
    // Esto se mapea al endpoint del microservicio /laboratories/stats a través de la ruta comodín del gateway /api/laboratories/:lab_id
    const response = await axiosInstance.get<LaboratoryStats>('/api/laboratories/stats');
    return response.data;
  },

  create: async (data: Record<string, any>): Promise<Laboratory> => {
    const response = await axiosInstance.post<Laboratory>('/api/laboratories', data);
    return response.data;
  },

  update: async (labId: number, data: Record<string, any>): Promise<Laboratory> => {
    const response = await axiosInstance.patch<Laboratory>(`/api/laboratories/${labId}`, data);
    return response.data;
  },

  toggleStatus: async (labId: number, status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE'): Promise<Laboratory> => {
    const response = await axiosInstance.patch<Laboratory>(`/api/laboratories/${labId}/status`, { status });
    return response.data;
  },

  delete: async (labId: number): Promise<void> => {
    await axiosInstance.delete(`/api/laboratories/${labId}`);
  },
};
