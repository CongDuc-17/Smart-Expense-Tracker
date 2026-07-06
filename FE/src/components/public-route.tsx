import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/features/auth/stores/auth.store";

export function PublicRoute() {
  const currentUser = useAuthStore((state) => state.currentUser);

  // Nếu đã đăng nhập, không cho phép vào trang auth mà đẩy về dashboard
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  // Nếu chưa đăng nhập, render các trang con (Login, Register...)
  return <Outlet />;
}
