export type FiscalPaymentMethod = 'pix' | 'cash';
export type FiscalParkingStatus = 'active' | 'expiring' | 'expired' | 'completed' | 'cancelled';

export interface FiscalParkingLocation {
  latitude?: number;
  longitude?: number;
  address?: string;
}

export interface CreateFiscalParkingInput {
  zoneId: string;
  plate: string;
  requestedMinutes: number;
  paymentMethod: FiscalPaymentMethod;
  location?: FiscalParkingLocation;
  observations?: string;
}

export interface FiscalParking {
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
  paymentMethod: FiscalPaymentMethod;
  status: FiscalParkingStatus;
  payment?: {
    id: string;
    qrCode?: string;
    qrCodeText?: string;
    expiresAt?: string;
  };
  createdAt: string;
}

export interface ListFiscalParkingsQuery {
  status?: FiscalParkingStatus;
  plate?: string;
  zoneId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface FiscalParkingListResponse {
  data: FiscalParking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FiscalStatistics {
  totalParkings: number;
  totalPixAmount: number;
  totalCashAmount: number;
  totalAmount: number;
  pixPaymentsCount: number;
  cashPaymentsCount: number;
  pendingPixPayments: number;
}

export interface FiscalStatisticsQuery {
  startDate?: string;
  endDate?: string;
}

