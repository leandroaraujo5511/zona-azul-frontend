import api from '@/lib/api';
import {
  CreateNotificationInput,
  Notification,
  NotificationPublicResponse,
  RecognizeNotificationInput,
  NotificationListResponse,
  NotificationPaymentResponse,
  ListNotificationsQuery,
} from '@/types/notification';

export const notificationService = {
  /**
   * Create notification (Fiscal/Admin)
   */
  async createNotification(input: CreateNotificationInput): Promise<Notification> {
    const response = await api.post<Notification>('/notifications', input);
    return response.data;
  },

  /**
   * Get notification by number (Public)
   */
  async getNotificationByNumber(notificationNumber: string): Promise<NotificationPublicResponse> {
    const response = await api.get<NotificationPublicResponse>(
      `/notifications/public/${notificationNumber}`
    );
    return response.data;
  },

  /**
   * Recognize notification (Public)
   */
  async recognizeNotification(
    notificationNumber: string,
    input: RecognizeNotificationInput
  ): Promise<Notification> {
    const response = await api.post<Notification>(
      `/notifications/${notificationNumber}/recognize`,
      input
    );
    return response.data;
  },

  /**
   * Create payment for notification
   */
  async createNotificationPayment(notificationId: string): Promise<NotificationPaymentResponse> {
    const response = await api.post<NotificationPaymentResponse>(
      `/notifications/${notificationId}/payment`
    );
    return response.data;
  },

  /**
   * List notifications (Fiscal/Admin)
   */
  async listNotifications(query?: ListNotificationsQuery): Promise<NotificationListResponse> {
    const params = new URLSearchParams();
    if (query?.status) params.append('status', query.status);
    if (query?.plate) params.append('plate', query.plate);
    if (query?.startDate) params.append('startDate', query.startDate);
    if (query?.endDate) params.append('endDate', query.endDate);
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());

    const response = await api.get<NotificationListResponse>(
      `/notifications?${params.toString()}`
    );
    return response.data;
  },
};

