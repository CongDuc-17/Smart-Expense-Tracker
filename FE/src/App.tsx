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
import { useInitializeAuth } from "@/features/auth/hooks/useAuth";

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

        {/* ── Fallback ────────────────────────────────────── */}
        {/* If user hits root, redirect to dashboard. ProtectedRoute will catch it if they are not logged in and push to login */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;