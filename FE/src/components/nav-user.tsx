// ============================================================
// NavUser — User Menu ở footer của Sidebar
// ============================================================

import { useNavigate } from "react-router-dom";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  EllipsisVerticalIcon,
  CircleUserRoundIcon,
  BellIcon,
  LogOutIcon,
  SunIcon,
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";
import { ModeToggle } from "./mode-toggle";

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ---------------------------------------------------------------
// Component
// ---------------------------------------------------------------

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await apiClient.post("/auth/logout", {}, { withCredentials: true });
    } catch {
      // Vẫn logout phía FE dù API lỗi
    } finally {
      toast.success("Đã đăng xuất");
      navigate("/login", { replace: true });
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-[rgba(55,53,47,0.08)] hover:bg-[rgba(55,53,47,0.06)] transition-colors duration-150"
            >
              <Avatar className="h-7 w-7 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg bg-[#37352F] text-white text-xs font-medium">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate text-sm font-medium text-[#37352F]">
                  {user.name}
                </span>
                <span className="truncate text-xs text-[#9B9A97]">
                  {user.email}
                </span>
              </div>
              <EllipsisVerticalIcon className="ml-auto size-4 text-[#9B9A97]" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg border border-[#E8E7E5] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.16)]"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            {/* User info */}
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-3 py-2.5">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg bg-[#37352F] text-white text-xs font-medium">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium text-[#37352F]">
                    {user.name}
                  </span>
                  <span className="truncate text-xs text-[#9B9A97]">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="bg-[#E8E7E5]" />

            <DropdownMenuGroup>
              <DropdownMenuItem className="text-sm text-[#37352F] cursor-pointer hover:bg-[rgba(55,53,47,0.06)] focus:bg-[rgba(55,53,47,0.06)]">
                <CircleUserRoundIcon className="mr-2 h-4 w-4 text-[#9B9A97]" />
                Tài khoản
              </DropdownMenuItem>
              <DropdownMenuItem className="text-sm text-[#37352F] cursor-pointer hover:bg-[rgba(55,53,47,0.06)] focus:bg-[rgba(55,53,47,0.06)]">
                <BellIcon className="mr-2 h-4 w-4 text-[#9B9A97]" />
                Thông báo
              </DropdownMenuItem>

            </DropdownMenuGroup>

            <DropdownMenuSeparator className="bg-[#E8E7E5]" />

            <DropdownMenuItem
              className="text-sm text-red-500 cursor-pointer hover:bg-red-50 focus:bg-red-50 focus:text-red-500"
              onClick={handleLogout}
            >
              <LogOutIcon className="mr-2 h-4 w-4" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
