import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { Loader2 } from "lucide-react";

export function AdminRoute() {
  const { isAuthenticated, isInitializing, currentUser } = useAuthStore();

  if (isInitializing) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser?.role !== "ADMIN") {
    // If authenticated but not admin, kick them back to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
