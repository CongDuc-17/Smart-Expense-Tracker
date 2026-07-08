import { Outlet, Navigate } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { SiteHeader } from "@/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
  TooltipProvider,
} from "@/components/ui/tooltip";

export function AdminLayout() {
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.get('oauth_admin') === 'true') {
    localStorage.setItem("adminToken", "true");
  }

  const adminToken = localStorage.getItem("adminToken");

  if (!adminToken) {
    return <Navigate to="/login" replace />;
  }


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
        <AdminSidebar />

        {/* ── Main content area ─────────────────────────── */}
        <SidebarInset className="bg-background min-h-screen">
          {/* Top bar */}
          <SiteHeader />

          {/* Page content */}
          <main className="flex flex-1 flex-col p-4 pt-0 min-h-0 bg-background">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
