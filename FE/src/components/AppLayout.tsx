// ============================================================
// AppLayout — Authenticated App Layout
// Cấu trúc: TooltipProvider > SidebarProvider > AppSidebar + SidebarInset
//
// Tất cả authenticated routes đều được wrap bởi component này.
// Sidebar collapsible="icon": thu lại thành icon-only khi click toggle.
//
// LÝ DO TooltipProvider:
// Khi sidebar ở chế độ icon-only, shadcn Sidebar tự động render Tooltip
// để hiển thị label khi hover. Tooltip yêu cầu TooltipProvider trong tree.
// ============================================================

import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { AiReceiptDrawer } from "@/features/ai/components/AiReceiptDrawer";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useCurrentUser } from "@/features/users/hooks/useUser";

export function AppLayout() {
  useCurrentUser();

  return (
    <TooltipProvider delayDuration={300}>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "220px",
            "--sidebar-width-icon": "48px",
          } as React.CSSProperties
        }
      >
        {/* ── Sidebar ───────────────────────────────────── */}
        <AppSidebar />

        {/* ── Main content area ─────────────────────────── */}
        <SidebarInset className="bg-background min-h-screen">
          {/* Top bar với trigger + page title */}
          <SiteHeader />

          {/* Page content — mỗi route render vào đây */}
          <main className="flex flex-1 flex-col p-4 pt-0 min-h-0 bg-background">
            <Outlet />
          </main>
        </SidebarInset>
        <AiReceiptDrawer />
      </SidebarProvider>
    </TooltipProvider>
  );
}
