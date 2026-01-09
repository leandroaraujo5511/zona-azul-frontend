import api from '@/lib/api';
import {
  Parking,
  ParkingByPlateResponse,
  ParkingsListResponse,
  DashboardMetrics,
} from '@/types/api';

export const parkingService = {
  /**
   * Get parking by plate (Fiscal/Admin)
   */
  async getParkingByPlate(plate: string): Promise<ParkingByPlateResponse> {
    const response = await api.get<ParkingByPlateResponse>(
      `/parkings/plate/${plate}`
    );
    return response.data;
  },

  /**
   * Get all parkings (Admin/Fiscal - history)
   */
  async getAllParkings(params?: {
    status?: 'active' | 'expiring' | 'expired' | 'completed' | 'cancelled';
    vehicleId?: string;
    zoneId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<ParkingsListResponse> {
    const response = await api.get<ParkingsListResponse>('/parkings/history/all', {
      params,
    });
    return response.data;
  },

  /**
   * Get dashboard metrics (Admin)
   */
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const response = await api.get<DashboardMetrics>(
      '/parkings/dashboard/metrics'
    );
    return response.data;
  },

  /**
   * Create avulso parking (Fiscal/Admin)
   * This method handles finding/creating vehicle and creating parking
   */
  async createAvulsoParking(input: {
    plate: string;
    zoneId: string;
    requestedMinutes: number;
  }): Promise<Parking> {
    const response = await api.post<Parking>('/parkings/avulso', input);
    return response.data;
  },
};






