import api from '@/lib/api';
import {
  FiscalSettlement,
  SettlementListResponse,
  ReviewSettlementInput,
  ListSettlementsQuery,
} from '@/types/fiscal-settlement';

export const fiscalSettlementService = {
  /**
   * Generate settlement (Fiscal/Admin)
   */
  async generateSettlement(fiscalId?: string, periodDays?: number): Promise<FiscalSettlement> {
    const response = await api.post<FiscalSettlement>('/fiscal-settlements/generate', {
      fiscalId,
      periodDays,
    });
    return response.data;
  },

  /**
   * List settlements (Fiscal/Admin)
   */
  async listSettlements(query?: ListSettlementsQuery): Promise<SettlementListResponse> {
    const params = new URLSearchParams();
    if (query?.status) params.append('status', query.status);
    if (query?.fiscalId) params.append('fiscalId', query.fiscalId);
    if (query?.startDate) params.append('startDate', query.startDate);
    if (query?.endDate) params.append('endDate', query.endDate);
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());

    const response = await api.get<SettlementListResponse>(
      `/fiscal-settlements?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Get settlement by ID (Fiscal/Admin)
   */
  async getSettlementById(id: string): Promise<FiscalSettlement> {
    const response = await api.get<FiscalSettlement>(`/fiscal-settlements/${id}`);
    return response.data;
  },

  /**
   * Review settlement (Admin only)
   */
  async reviewSettlement(id: string, input: ReviewSettlementInput): Promise<FiscalSettlement> {
    const response = await api.post<FiscalSettlement>(`/fiscal-settlements/${id}/review`, input);
    return response.data;
  },

  /**
   * Get pending settlements (Admin only)
   */
  async getPendingSettlements(fiscalId?: string, page = 1, limit = 20): Promise<SettlementListResponse> {
    const params = new URLSearchParams();
    if (fiscalId) params.append('fiscalId', fiscalId);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await api.get<SettlementListResponse>(
      `/fiscal-settlements/pending?${params.toString()}`
    );
    return response.data;
  },
};

