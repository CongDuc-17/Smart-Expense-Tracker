export type NotificationType = 
  | "BUDGET_WARNING" 
  | "BUDGET_EXCEEDED" 
  | "GOAL_REACHED" 
  | "AI_INSIGHT" 
  | "SYSTEM";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  metadata?: Record<string, any> | null;
  readAt?: string | null;
  createdAt: string;
}

export interface NotificationListResponse {
  status: string;
  data: NotificationItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  unreadCount: number;
}

export interface MarkAsReadResponse {
  status: string;
  data: {
    id: string;
    isRead: boolean;
    readAt: string;
  };
}

export interface MarkAllAsReadResponse {
  status: string;
  data: {
    updatedCount: number;
  };
}
