import React from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { vi } from "date-fns/locale";
import { Bell, CheckCircle2, AlertTriangle, Sparkles, AlertCircle, BellRing } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NotificationItem, NotificationType } from "../types/notification.types";

interface NotificationListProps {
  notifications: NotificationItem[];
  isLoading: boolean;
  onMarkAsRead: (id: string) => void;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "BUDGET_WARNING":
      return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    case "BUDGET_EXCEEDED":
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    case "GOAL_REACHED":
      return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    case "AI_INSIGHT":
      return <Sparkles className="w-5 h-5 text-purple-500" />;
    case "SYSTEM":
    default:
      return <Bell className="w-5 h-5 text-[#9B9A97]" />;
  }
};

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "Vừa xong";
  
  // Custom format to match Notion style (e.g. "2 phút trước", "Hôm qua")
  let formatted = formatDistanceToNowStrict(date, { addSuffix: true, locale: vi });
  // Remove "khoảng " if date-fns adds it
  formatted = formatted.replace("khoảng ", "");
  
  // Custom rules
  if (formatted === "1 ngày trước") return "Hôm qua";
  
  return formatted;
};

// Memoize item to prevent re-renders on unrelated state changes
const NotificationItemComponent = React.memo(({ 
  notification, 
  onMarkAsRead 
}: { 
  notification: NotificationItem; 
  onMarkAsRead: (id: string) => void 
}) => {
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 mx-2 my-1 rounded-lg transition-colors duration-150 cursor-pointer group",
        !notification.isRead ? "bg-[#F7F6F3]" : "hover:bg-[rgba(55,53,47,0.04)]"
      )}
      onClick={() => {
        if (!notification.isRead) {
          onMarkAsRead(notification.id);
        }
        // In a real app, here we might also navigate to the related entity
        // using notification.metadata
      }}
    >
      <div className="shrink-0 mt-0.5">
        {getNotificationIcon(notification.type)}
      </div>
      
      <div className="flex-1 min-w-0 pr-2">
        <h4 className="text-sm font-medium text-[#37352F] mb-0.5 truncate">
          {notification.title}
        </h4>
        <p className="text-[13px] text-[#5A5A57] line-clamp-2 leading-snug">
          {notification.message}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs text-[#9B9A97]">
            {formatRelativeTime(notification.createdAt)}
          </span>
          {!notification.isRead && (
            <span className="flex items-center text-[10px] font-medium text-blue-500">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5" />
              Mới
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

NotificationItemComponent.displayName = "NotificationItemComponent";

export function NotificationList({ notifications, isLoading, onMarkAsRead }: NotificationListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col p-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-3 p-3 mx-2 my-1">
            <div className="w-5 h-5 rounded-full bg-[#E8E7E5] animate-pulse shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-[#E8E7E5] rounded animate-pulse w-2/3" />
              <div className="h-3 bg-[#E8E7E5] rounded animate-pulse w-full" />
              <div className="h-3 bg-[#E8E7E5] rounded animate-pulse w-1/4 mt-2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center h-[250px]">
        <div className="w-12 h-12 rounded-2xl bg-[#F7F6F3] flex items-center justify-center mb-4 text-[#9B9A97]">
          <BellRing className="w-6 h-6 stroke-[1.5]" />
        </div>
        <p className="text-[15px] font-medium text-[#37352F] mb-1">Chưa có thông báo</p>
        <p className="text-[13px] text-[#9B9A97] max-w-[200px] leading-relaxed">
          Khi có giao dịch hoặc AI Insight mới, thông báo sẽ xuất hiện tại đây.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col py-2">
      {notifications.map((notification) => (
        <NotificationItemComponent 
          key={notification.id} 
          notification={notification} 
          onMarkAsRead={onMarkAsRead} 
        />
      ))}
    </div>
  );
}
