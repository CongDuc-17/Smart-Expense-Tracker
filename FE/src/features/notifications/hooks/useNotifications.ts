import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "../services/notification.service";
import { getSocket } from "@/lib/socketClient";
import { toast } from "sonner";
import type { NotificationItem, NotificationListResponse } from "../types/notification.types";

export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (filters: string) => [...notificationKeys.lists(), { filters }] as const,
};

export function useNotifications(params?: { isRead?: boolean; page?: number; limit?: number }) {
  return useQuery({
    queryKey: notificationKeys.list(JSON.stringify(params || {})),
    queryFn: () => notificationService.getList(params),
    staleTime: 60 * 1000,
  });
}

export function useNotificationSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getSocket();
    
    // Always connect when this hook is mounted (e.g., user is logged in)
    socket.connect();

    const handleNewNotification = (notification: NotificationItem) => {
      // 1. Show toast
      toast.info(`Bạn có thông báo mới`, {
        description: notification.title,
      });

      // 2. Update list and unread count immediately in ALL cached queries
      queryClient.setQueriesData<NotificationListResponse>(
        { queryKey: notificationKeys.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: [notification, ...old.data],
            unreadCount: (old.unreadCount || 0) + 1,
          };
        }
      );
    };

    socket.on("NEW_NOTIFICATION", handleNewNotification);

    return () => {
      socket.off("NEW_NOTIFICATION", handleNewNotification);
      // We don't disconnect here because other components might still use the socket
    };
  }, [queryClient]);
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: notificationKeys.lists() });

      // Snapshot the previous value
      const previousQueries = queryClient.getQueriesData<NotificationListResponse>({ queryKey: notificationKeys.lists() });

      // Optimistically update to the new value
      queryClient.setQueriesData<NotificationListResponse>(
        { queryKey: notificationKeys.lists() },
        (old) => {
          if (!old) return old;
          const updatedData = old.data.map(n => n.id === id ? { ...n, isRead: true } : n);
          // Only decrement unreadCount if the item was previously unread in this list
          const wasUnread = old.data.find(n => n.id === id && !n.isRead);
          return {
            ...old,
            data: updatedData,
            unreadCount: wasUnread ? Math.max(0, old.unreadCount - 1) : old.unreadCount,
          };
        }
      );

      return { previousQueries };
    },
    onError: (_err, _id, context) => {
      // Rollback on error
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Keep it synced with server after mutation settles
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.lists() });
      const previousQueries = queryClient.getQueriesData<NotificationListResponse>({ queryKey: notificationKeys.lists() });

      queryClient.setQueriesData<NotificationListResponse>(
        { queryKey: notificationKeys.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map(n => ({ ...n, isRead: true })),
            unreadCount: 0,
          };
        }
      );

      return { previousQueries };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
  });
}
