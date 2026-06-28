// ============================================================
// SiteHeader — Top bar của layout chính
// Hiển thị SidebarTrigger + tên trang hiện tại
// ============================================================

import { useLocation } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

// Map route → tên trang
const PAGE_TITLES: Record<string, string> = {
  "/dashboard":    "Tổng quan",
  "/transactions": "Giao dịch",
  "/categories":   "Danh mục",
  "/budgets":      "Ngân sách",
  "/savings":      "Mục tiêu tiết kiệm",
  "/insights":     "AI Insights",
  "/settings":     "Cài đặt",
  "/help":         "Trợ giúp",
};

export function SiteHeader() {
  const location = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] ?? "Expense Tracker";

  return (
    <header className="
      flex h-12 shrink-0 items-center gap-2
      border-b border-[#E8E7E5] bg-[#FFFEFC]
      px-4 lg:px-6
      transition-[width,height] ease-linear
    ">
      {/* Sidebar toggle button */}
      <SidebarTrigger
        className="
          -ml-1 w-7 h-7 text-[#9B9A97]
          hover:text-[#37352F] hover:bg-[rgba(55,53,47,0.08)]
          rounded-md transition-colors duration-150
        "
      />

      <Separator
        orientation="vertical"
        className="mx-1 h-4 bg-[#E8E7E5]"
      />

      {/* Page title */}
      <h1 className="text-sm font-medium text-[#37352F]">
        {pageTitle}
      </h1>
    </header>
  );
}
