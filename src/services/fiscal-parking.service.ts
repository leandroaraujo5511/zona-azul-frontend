import api from '@/lib/api';
import {
  CreateFiscalParkingInput,
  FiscalParking,
  FiscalParkingListResponse,
  FiscalStatistics,
  ListFiscalParkingsQuery,
  FiscalStatisticsQuery,
} from '@/types/fiscal-parking';

export const fiscalParkingService = {
  /**
   * Create fiscal parking (Fiscal/Admin)
   */
  async createFiscalParking(input: CreateFiscalParkingInput): Promise<FiscalParking> {
    const response = await api.post<FiscalParking>('/fiscal-parkings', input);
    return response.data;
  },

  /**
   * List fiscal parkings (Fiscal/Admin)
   */
  async listFiscalParkings(query?: ListFiscalParkingsQuery): Promise<FiscalParkingListResponse> {
    const params = new URLSearchParams();
    if (query?.status) params.append('status', query.status);
    if (query?.plate) params.append('plate', query.plate);
    if (query?.zoneId) params.append('zoneId', query.zoneId);
    if (query?.startDate) params.append('startDate', query.startDate);
    if (query?.endDate) params.append('endDate', query.endDate);
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());

    const response = await api.get<FiscalParkingListResponse>(
      `/fiscal-parkings?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Get fiscal parking by ID (Fiscal/Admin)
   */
  async getFiscalParkingById(id: string): Promise<FiscalParking> {
    const response = await api.get<FiscalParking>(`/fiscal-parkings/${id}`);
    return response.data;
  },

  /**
   * Get fiscal statistics (Fiscal/Admin)
   */
  async getFiscalStatistics(query?: FiscalStatisticsQuery): Promise<FiscalStatistics> {
    const params = new URLSearchParams();
    if (query?.startDate) params.append('startDate', query.startDate);
    if (query?.endDate) params.append('endDate', query.endDate);

    const response = await api.get<FiscalStatistics>(
      `/fiscal-parkings/statistics?${params.toString()}`
    );
    return response.data;
  },
};

