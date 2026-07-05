import React, { useState } from "react";
import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NotificationList } from "./NotificationList";
import { useNotifications, useMarkAsRead, useMarkAllAsRead, useNotificationSocket } from "../hooks/useNotifications";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Initialize Socket connection and listener
  useNotificationSocket();
  
  // The SINGLE Source of Truth for Notifications
  const { data: listData, isLoading } = useNotifications({ 
    limit: 20, 
    page: 1 
  });
  
  const notifications = listData?.data || [];
  const unreadCount = listData?.unreadCount || 0;
  const totalCount = listData?.pagination?.total || notifications.length;

  // Mutations
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead();

  const handleMarkAllAsRead = () => {
    if (unreadCount > 0) {
      markAllAsRead();
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative w-8 h-8 text-[#9B9A97] hover:text-[#37352F] hover:bg-[rgba(55,53,47,0.08)] rounded-md transition-colors duration-150"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] p-0 px-1 text-[10px] font-bold bg-red-500 text-white border-2 border-white"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        align="end" 
        className="w-[380px] p-0 bg-white border-[#E8E7E5] shadow-lg rounded-xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex flex-col p-4 border-b border-[#E8E7E5] shrink-0 bg-white">
          <div className="flex items-center gap-1.5 mb-1">
            <h3 className="font-semibold text-[#37352F] text-base">Thông báo</h3>
            <span className="text-[#9B9A97] text-sm">({totalCount})</span>
          </div>
          
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm text-[#5A5A57]">
              {unreadCount > 0 ? (
                <span className="font-medium text-[#37352F]">{unreadCount} chưa đọc</span>
              ) : (
                "Đã xem tất cả"
              )}
            </span>
            
            <button
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0 || isMarkingAll}
              className="text-xs text-[#9B9A97] hover:text-[#37352F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-medium"
            >
              Đánh dấu tất cả đã đọc
            </button>
          </div>
        </div>

        {/* List - max height ~8 items, allows scrolling */}
        <div className="overflow-y-auto overscroll-contain flex-1 max-h-[500px]">
          <NotificationList 
            notifications={notifications} 
            isLoading={isLoading} 
            onMarkAsRead={markAsRead}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
