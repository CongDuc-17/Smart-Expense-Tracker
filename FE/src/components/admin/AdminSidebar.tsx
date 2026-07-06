// ============================================================
// AdminSidebar — Admin Application Sidebar
// ============================================================

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboardIcon,
  UsersIcon,
  ShieldAlertIcon,
} from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";

// ---------------------------------------------------------------
// Navigation config
// ---------------------------------------------------------------

const NAV_MAIN = [
  { title: "Tổng quan",   url: "/admin/dashboard",    icon: <LayoutDashboardIcon className="w-4 h-4" /> },
  { title: "Người dùng",   url: "/admin/users", icon: <UsersIcon className="w-4 h-4" /> },
];

// ---------------------------------------------------------------
// Component
// ---------------------------------------------------------------

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const safeUser = {
    name: "System Admin",
    email: "Quản trị viên",
    avatar: "",
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border bg-background"
      {...props}
    >
      <SidebarHeader className="px-3 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="hover:bg-accent hover:text-accent-foreground transition-colors duration-150"
              tooltip="Admin Panel"
            >
              <a href="/admin/dashboard" className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ShieldAlertIcon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-foreground truncate">
                  Admin Panel
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <NavMain items={NAV_MAIN} />
      </SidebarContent>

      <SidebarFooter className="px-3 pb-4 border-t border-border pt-3">
        <NavUser user={safeUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
