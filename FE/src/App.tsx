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

import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { VerifyEmail } from "./pages/auth/VerifyEmail";
import { ForgotPassword } from "./pages/auth/ForgotPassword";
import { AppLayout } from "./components/AppLayout";
import { ThemeProvider } from "@/components/theme-provider"
function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">

      <Routes>
        {/* ── Public routes (no sidebar) ──────────────────── */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ── Authenticated routes (with AppLayout sidebar) ─ */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/budgets" element={<BudgetsPage />} />
          <Route path="/savings" element={<SavingGoalsPage />} />
          <Route path="/insights" element={<AiInsightsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* ── Admin routes ──────────────────────────────────── */}
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
        </Route>

        {/* ── Fallback ────────────────────────────────────── */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;