import { Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { Dashboard } from "./pages/Dashboard";
import { CategoriesPage } from "./pages/categories/CategoriesPage";
import { TransactionsPage } from "./pages/transactions/TransactionsPage";
import { AppLayout } from "./components/AppLayout";
import { VerifyEmail } from "./pages/auth/VerifyEmail";
import { ForgotPassword } from "./pages/auth/ForgotPassword";
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
          {/* Phase 3+ routes sẽ thêm vào đây */}
          {/* <Route path="/transactions" element={<TransactionsPage />} /> */}
          {/* <Route path="/budgets"      element={<BudgetsPage />} /> */}
          {/* <Route path="/savings"      element={<SavingsPage />} /> */}
          {/* <Route path="/insights"     element={<InsightsPage />} /> */}
        </Route>

        {/* ── Fallback ────────────────────────────────────── */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;