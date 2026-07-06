// ============================================================
// TransactionsPage — Feature Page
// Phase 3 — Expense & Income Module
// Route: /transactions
//
// Layout:
// - Page header (title + "Thêm" button)
// - Summary bar (tổng thu / tổng chi / số dư)
// - Filter bar (tabs + month/year picker)
// - Transaction list (grouped by date)
// - Overlays (Sheet + Dialog)
// ============================================================

import { useMemo } from "react";
import { Plus, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TransactionFilters } from "@/features/transactions/components/TransactionFilters";
import { TransactionList } from "@/features/transactions/components/TransactionList";
import { TransactionSkeleton } from "@/features/transactions/components/TransactionSkeleton";
import { TransactionEmptyState } from "@/features/transactions/components/TransactionEmptyState";
import { TransactionSheet } from "@/features/transactions/components/TransactionSheet";
import { DeleteTransactionDialog } from "@/features/transactions/components/DeleteTransactionDialog";
import { AiResumeBanner } from "@/features/ai/components/AiResumeBanner";
import { formatVND } from "@/features/transactions/components/AmountDisplay";
import { useTransactions } from "@/features/transactions/hooks/useTransactions";
import { useShallow } from "zustand/react/shallow";
import {
  useTransactionStore,
  selectTransactionFilters,
} from "@/features/transactions/stores/transaction.store";
import type { Transaction, TransactionSummary } from "@/features/transactions/types/transaction.types";

// ---------------------------------------------------------------
// Summary Bar Component
// ---------------------------------------------------------------

function SummaryBar({ summary }: { summary: TransactionSummary }) {
  const items = [
    {
      label: "Thu nhập",
      value: summary.totalIncome,
      icon: TrendingUp,
      color: "#1DD1A1",
      bg: "#1DD1A120",
    },
    {
      label: "Chi tiêu",
      value: summary.totalExpense,
      icon: TrendingDown,
      color: "#FF6B6B",
      bg: "#FF6B6B20",
    },
    {
      label: "Số dư",
      value: summary.balance,
      icon: Minus,
      color: summary.balance >= 0 ? "#37352F" : "#FF6B6B",
      bg: "#37352F10",
      status: summary.balance >= 0 ? "Tích luỹ tốt" : "Thâm hụt",
      statusColor: summary.balance >= 0 ? "text-emerald-600" : "text-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {items.map(({ label, value, icon: Icon, color, bg, status, statusColor }) => (
        <div
          key={label}
          className="flex flex-col gap-2 p-4 rounded-lg border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.06)] relative overflow-hidden"
        >
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: bg }}
            >
              <Icon className="w-3.5 h-3.5" style={{ color }} />
            </div>
            <span className="text-xs text-muted-foreground font-medium">{label}</span>
          </div>
          <div className="flex items-end justify-between mt-1">
            <p className="text-base font-semibold leading-5" style={{ color }}>
              {value >= 0 ? "" : "-"}{formatVND(Math.abs(value))}
            </p>
            {status && (
              <span className={`text-[11px] font-medium ${statusColor}`}>
                {status}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------
// Error Banner
// ---------------------------------------------------------------

function ErrorBanner({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 mb-6 rounded-lg border border-border bg-muted text-sm text-foreground" role="alert">
      <span>Không thể tải giao dịch. Vui lòng thử lại.</span>
      <button onClick={onRetry} className="text-sm font-medium text-foreground underline underline-offset-2 hover:text-foreground/80 transition-colors duration-150 ml-4">
        Thử lại
      </button>
    </div>
  );
}

// ---------------------------------------------------------------
// TransactionsPage
// ---------------------------------------------------------------

export function TransactionsPage() {
  // ─── Store ──────────────────────────────────────────────────
  const {
    activeTab,
    openCreateSheet,
    openEditSheet,
    openDeleteDialog,
    searchQuery,
    sortMode,
    selectedMonth,
    selectedYear
  } = useTransactionStore();

  const filters = useTransactionStore(useShallow(selectTransactionFilters));

  // ─── Server Data ─────────────────────────────────────────────
  const { transactions, isLoading, isError, refetch } = useTransactions({
    activeTab,
    filters,
    searchQuery,
    sortMode
  });

  // ─── Summary (client-side calculation) ───────────────────────
  const summary: TransactionSummary = useMemo(() => {
    const totalIncome = transactions.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);
    return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
  }, [transactions]);

  // ─── Derived states ──────────────────────────────────────────
  const isFiltered = activeTab !== "ALL";
  const isEmpty = !isLoading && transactions.length === 0;

  // ─── Handlers ────────────────────────────────────────────────
  const handleEdit = (t: Transaction) => openEditSheet(t);
  const handleDelete = (t: Transaction) => openDeleteDialog(t);

  // ─── Render ──────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-full bg-background">
      <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-8">

        {/* Page Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground leading-8 tracking-tight">
              Giao dịch
            </h1>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2 leading-5">
              Theo dõi thu chi
              <span className="w-1 h-1 rounded-full bg-muted" />
              <span>
                {isLoading ? "Đang tải..." : `${transactions.length} giao dịch tháng ${selectedMonth}/${selectedYear}`}
              </span>
            </p>
          </div>
          <Button
            onClick={() => openCreateSheet()}
            size="sm"
            className="bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 active:scale-95 transition-colors duration-150 flex items-center gap-1.5 h-9"
          >
            <Plus className="w-4 h-4" />
            Thêm giao dịch
          </Button>
        </div>

        <AiResumeBanner />

        {/* Summary */}
        {!isLoading && !isError && (
          <SummaryBar summary={summary} />
        )}

        {/* Filters */}
        <div className="mb-5">
          <TransactionFilters />
        </div>

        {/* Error */}
        {isError && <ErrorBanner onRetry={refetch} />}

        {/* Content */}
        {isLoading ? (
          <TransactionSkeleton groups={3} cardsPerGroup={3} />
        ) : isEmpty ? (
          <TransactionEmptyState
            variant={isFiltered ? "filtered" : "empty"}
            onCreateClick={!isFiltered ? () => openCreateSheet() : undefined}
          />
        ) : (
          <TransactionList
            transactions={transactions}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Overlays */}
      <TransactionSheet />
      <DeleteTransactionDialog />
    </div>
  );
}
