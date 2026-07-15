import { Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { Dashboard } from "./pages/Dashboard";
import { CategoriesPage } from "./pages/categories/CategoriesPage";
import { TransactionsPage } from "./pages/transactions/TransactionsPage";
import BudgetsPage from "./pages/budgets/BudgetsPage";
import { SavingGoalsPage } from "./pages/saving-goals/SavingGoalsPage";
import { AiInsightsPage } from "./pages/ai-insights/AiInsightsPage";
import SettingsPage from "./pages/settings/SettingsPage";
import NotFoundPage from "./pages/not-found/NotFoundPage";

import { AppLayout } from "./components/AppLayout";
import { VerifyEmail } from "./pages/auth/VerifyEmail";
import { ForgotPassword } from "./pages/auth/ForgotPassword";
import { ThemeProvider } from "@/components/theme-provider";
import { PublicRoute } from "./components/public-route";
import { ProtectedRoute } from "./components/protected-route";
import { AdminRoute } from "./components/admin-route";
import { useInitializeAuth } from "@/features/auth/hooks/useAuth";
import { useAuthStore } from "@/features/auth/stores/auth.store";

import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { AdminStatsPage } from "./pages/admin/AdminStatsPage";

function IndexRedirect() {
  const { currentUser } = useAuthStore();
  if (currentUser?.role === "ADMIN") {
    return <Navigate to="/admin/stats" replace />;
  }
  return <Navigate to="/dashboard" replace />;
}

function App() {
  useInitializeAuth();

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">

      <Routes>
        {/* ── Public routes (no sidebar) ──────────────────── */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* ── Authenticated routes (with AppLayout sidebar) ─ */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/budgets" element={<BudgetsPage />} />
            <Route path="/savings" element={<SavingGoalsPage />} />
            <Route path="/insights" element={<AiInsightsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* ── Admin routes ─────────────────────────────────── */}
        <Route element={<AdminRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/stats" element={<AdminStatsPage />} />
          </Route>
        </Route>

        {/* ── Fallback ────────────────────────────────────── */}
        <Route path="/" element={<IndexRedirect />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;