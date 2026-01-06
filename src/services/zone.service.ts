import api from '@/lib/api';
import {
  Zone,
  CreateZoneRequest,
  UpdateZoneRequest,
  ZonesListResponse,
} from '@/types/api';

export const zoneService = {
  /**
   * Get all zones
   */
  async getAllZones(params?: {
    status?: 'active' | 'inactive';
    search?: string;
    latitude?: number;
    longitude?: number;
    page?: number;
    limit?: number;
  }): Promise<ZonesListResponse> {
    const response = await api.get<ZonesListResponse>('/zones', { params });
    return response.data;
  },

  /**
   * Get zone by ID
   */
  async getZoneById(id: string): Promise<Zone> {
    const response = await api.get<Zone>(`/zones/${id}`);
    return response.data;
  },

  /**
   * Create zone (Admin only)
   */
  async createZone(data: CreateZoneRequest): Promise<Zone> {
    const response = await api.post<Zone>('/zones', data);
    return response.data;
  },

  /**
   * Update zone (Admin only)
   */
  async updateZone(id: string, data: UpdateZoneRequest): Promise<Zone> {
    const response = await api.put<Zone>(`/zones/${id}`, data);
    return response.data;
  },

  /**
   * Delete zone (Admin only)
   */
  async deleteZone(id: string): Promise<void> {
    await api.delete(`/zones/${id}`);
  },
};





