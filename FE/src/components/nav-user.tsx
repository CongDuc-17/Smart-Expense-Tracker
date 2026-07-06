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
  LogOutIcon,
} from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
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
  const { logout } = useAuth();

  function handleLogout() {
    logout();
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-[rgba(55,53,47,0.08)] hover:bg-accent hover:text-accent-foreground transition-colors duration-150"
            >
              <Avatar className="h-7 w-7 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-xs font-medium">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate text-sm font-medium text-foreground">
                  {user.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
              <EllipsisVerticalIcon className="ml-auto size-4 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg border border-border bg-card shadow-[0_8px_24px_rgba(0,0,0,0.16)]"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            {/* User info */}
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-3 py-2.5">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-xs font-medium">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium text-foreground">
                    {user.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="bg-muted" />

            <DropdownMenuGroup>
              <DropdownMenuItem
                className="text-sm text-foreground cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                onClick={() => navigate("/settings")}
              >
                <CircleUserRoundIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                Tài khoản
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex justify-between text-sm text-foreground cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"

              >
                <span>Giao diện</span>
                <ModeToggle />
              </DropdownMenuItem>


            </DropdownMenuGroup>

            <DropdownMenuSeparator className="bg-muted" />

            <DropdownMenuItem
              className="text-sm text-red-500 cursor-pointer hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 text-destructive focus:text-red-500"
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
