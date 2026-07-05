import { apiClient } from "@/lib/apiClient";
import type { 
  NotificationListResponse, 
  MarkAsReadResponse, 
  MarkAllAsReadResponse 
} from "../types/notification.types";

export const notificationService = {
  getList: async (params?: { isRead?: boolean; page?: number; limit?: number }): Promise<NotificationListResponse> => {
    const urlParams = new URLSearchParams();
    if (params?.isRead !== undefined) urlParams.append("isRead", String(params.isRead));
    if (params?.page !== undefined) urlParams.append("page", String(params.page));
    if (params?.limit !== undefined) urlParams.append("limit", String(params.limit));
    
    return await apiClient.get<NotificationListResponse>(`/notifications?${urlParams.toString()}`);
  },

  markAsRead: async (id: string): Promise<MarkAsReadResponse> => {
    return await apiClient.patch<MarkAsReadResponse>(`/notifications/${id}/read`, {});
  },

  markAllAsRead: async (): Promise<MarkAllAsReadResponse> => {
    return await apiClient.patch<MarkAllAsReadResponse>("/notifications/read-all", {});
  }
};
