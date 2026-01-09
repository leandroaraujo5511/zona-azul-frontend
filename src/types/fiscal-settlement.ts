export type FiscalSettlementStatus = 'pending' | 'reviewed' | 'approved' | 'rejected';

export interface FiscalSettlement {
  id: string;
  fiscal: {
    id: string;
    name: string;
    email: string;
  };
  periodStart: string;
  periodEnd: string;
  totalParkings: number;
  totalPixAmount: number;
  totalCashAmount: number;
  totalAmount: number;
  pixPaymentsCount: number;
  cashPaymentsCount: number;
  status: FiscalSettlementStatus;
  reviewedBy?: {
    id: string;
    name: string;
  };
  reviewedAt?: string;
  observations?: string;
  parkings?: FiscalParkingDetail[];
  createdAt: string;
  updatedAt: string;
}

export interface FiscalParkingDetail {
  id: string;
  plate: string;
  zone: {
    id: string;
    name: string;
    code: string;
  };
  startTime: string;
  expectedEndTime: string;
  requestedMinutes: number;
  amount: number;
  paymentMethod: 'pix' | 'cash';
  status: string;
  payment?: {
    id: string;
    status: string;
    createdAt: string;
  };
  createdAt: string;
}

export interface ReviewSettlementInput {
  status: 'approved' | 'rejected';
  observations?: string;
}

export interface ListSettlementsQuery {
  status?: FiscalSettlementStatus;
  fiscalId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface SettlementListResponse {
  data: FiscalSettlement[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

