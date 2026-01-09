export type NotificationStatus = 'pending' | 'recognized' | 'paid' | 'expired' | 'converted';

export interface NotificationLocation {
  latitude?: number;
  longitude?: number;
  address?: string;
}

export interface CreateNotificationInput {
  plate: string;
  location?: NotificationLocation;
  observations?: string;
}

export interface Notification {
  id: string;
  notificationNumber: string;
  plate: string;
  status: NotificationStatus;
  amount: number;
  expiresAt: string;
  paidAt?: string;
  convertedToFineAt?: string;
  location?: NotificationLocation;
  observations?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPublicResponse {
  id: string;
  notificationNumber: string;
  plate: string;
  status: NotificationStatus;
  amount: number;
  expiresAt: string;
  createdAt: string;
}

export interface RecognizeNotificationInput {
  cpf: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface ListNotificationsQuery {
  status?: NotificationStatus;
  plate?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface NotificationListResponse {
  data: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface NotificationPaymentResponse {
  payment: {
    id: string;
    amount: number;
    method: string;
    status: string;
    expiresAt: string;
    qrCode?: string;
    qrCodeText?: string;
    providerTransactionId: string;
  };
  notification: {
    id: string;
    notificationNumber: string;
    plate: string;
  };
}

