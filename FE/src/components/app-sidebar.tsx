// ============================================================
// AppSidebar — Main Application Sidebar
// Notion Style: neutral, minimal, collapsible
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
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  LayoutDashboardIcon,
  TagIcon,
  ArrowUpDownIcon,
  WalletIcon,
  PiggyBankIcon,
  SparklesIcon,
  Settings2Icon,
  CircleHelpIcon,
  DollarSignIcon,
} from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";

// ---------------------------------------------------------------
// Navigation config
// ---------------------------------------------------------------

const NAV_MAIN = [
  { title: "Tổng quan",   url: "/dashboard",    icon: <LayoutDashboardIcon className="w-4 h-4" /> },
  { title: "Giao dịch",   url: "/transactions", icon: <ArrowUpDownIcon     className="w-4 h-4" /> },
  { title: "Danh mục",    url: "/categories",   icon: <TagIcon             className="w-4 h-4" /> },
  { title: "Ngân sách",   url: "/budgets",      icon: <WalletIcon          className="w-4 h-4" /> },
  { title: "Mục tiêu",    url: "/savings",      icon: <PiggyBankIcon       className="w-4 h-4" /> },
  { title: "AI Insights", url: "/insights",     icon: <SparklesIcon        className="w-4 h-4" /> },
];

const NAV_SECONDARY = [
  { title: "Cài đặt", url: "/settings", icon: <Settings2Icon className="w-4 h-4" /> },
  { title: "Trợ giúp", url: "/help",   icon: <CircleHelpIcon className="w-4 h-4" /> },
];



// ---------------------------------------------------------------
// Component
// ---------------------------------------------------------------

import { useUserStore } from "@/features/users/stores/user.store";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useUserStore((state) => state.currentUser);
  
  // Safe default if data is not loaded yet
  const safeUser = user ? {
    name: user.name,
    email: user.email,
    avatar: user.avatar || "",
  } : {
    name: "Đang tải...",
    email: "",
    avatar: "",
  };
  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-[#E8E7E5] bg-[#FFFEFC]"
      {...props}
    >
      {/* ── Header: Logo ────────────────────────────────── */}
      <SidebarHeader className="px-3 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="hover:bg-[rgba(55,53,47,0.06)] transition-colors duration-150"
              tooltip="Expense Tracker"
            >
              <a href="/dashboard" className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-[#37352F] rounded-lg flex items-center justify-center flex-shrink-0">
                  <DollarSignIcon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-[#37352F] truncate">
                  Expense Tracker
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ── Content: Navigation ─────────────────────────── */}
      <SidebarContent className="px-2">
        {/* Main nav */}
        <NavMain items={NAV_MAIN} />

        {/* Separator */}
        <SidebarSeparator className="bg-[#E8E7E5] my-1" />

        {/* Secondary nav */}
        <NavMain items={NAV_SECONDARY} />
      </SidebarContent>

      {/* ── Footer: User menu ───────────────────────────── */}
      <SidebarFooter className="px-3 pb-4 border-t border-[#E8E7E5] pt-3">
        <NavUser user={safeUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
