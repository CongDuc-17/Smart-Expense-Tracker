// ============================================================
// useTransactions — TanStack Query Data Hook
// Phase 3 — Expense & Income Module
//
// Chiến lược fetch:
// - Tab EXPENSE/INCOME: gọi 1 endpoint tương ứng
// - Tab ALL: gọi cả 2 endpoints song song (useQueries),
//   merge kết quả, sort by date desc client-side
// ============================================================

import { useQueries } from "@tanstack/react-query";
import { transactionService } from "@/features/transactions/services/transaction.service";
import type {
  TransactionTabFilter,
  TransactionFilters,
  Transaction,
} from "@/features/transactions/types/transaction.types";

// ---------------------------------------------------------------
// Query Keys Factory
// ---------------------------------------------------------------

export const transactionKeys = {
  all: ["transactions"] as const,
  lists: () => [...transactionKeys.all, "list"] as const,
  list: (type: string, filters: TransactionFilters) =>
    [...transactionKeys.lists(), type, filters] as const,
  detail: (type: string, id: string) =>
    [...transactionKeys.all, "detail", type, id] as const,
} as const;

// ---------------------------------------------------------------
// Hook
// ---------------------------------------------------------------

interface UseTransactionsOptions {
  activeTab: TransactionTabFilter;
  filters: TransactionFilters;
  searchQuery?: string;
  sortMode?: string;
  enabled?: boolean;
}

export function useTransactions({
  activeTab,
  filters,
  searchQuery = "",
  sortMode = "NEWEST",
  enabled = true,
}: UseTransactionsOptions) {
  const TYPES = activeTab === "ALL"
    ? (["EXPENSE", "INCOME"] as const)
    : ([activeTab] as const);

  const results = useQueries({
    queries: TYPES.map((type) => ({
      queryKey: transactionKeys.list(type, filters),
      queryFn: () => transactionService.getList(type, filters),
      staleTime: 60 * 1000,   // 1 phút
      gcTime: 5 * 60 * 1000,
      enabled,
      retry: (failureCount: number, error: unknown) => {
        const status = (error as { status?: number })?.status;
        if (status && status >= 400 && status < 500) return false;
        return failureCount < 1;
      },
    })),
  });

  // ─── Aggregate ──────────────────────────────────────────────
  const isLoading = results.some((r) => r.isLoading);
  const isError   = results.some((r) => r.isError);
  const error     = results.find((r) => r.error)?.error;

  // Merge tất cả transactions từ tất cả queries
  let transactions: Transaction[] = results
    .flatMap((r) => r.data?.data ?? []);

  // Client-side Filter (Search)
  if (searchQuery.trim()) {
    const lowerQuery = searchQuery.toLowerCase();
    transactions = transactions.filter(
      (t) =>
        t.title.toLowerCase().includes(lowerQuery) ||
        t.category.name.toLowerCase().includes(lowerQuery) ||
        (t.note && t.note.toLowerCase().includes(lowerQuery))
    );
  }

  // Client-side Sort
  transactions.sort((a, b) => {
    switch (sortMode) {
      case "OLDEST":
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case "HIGHEST_AMOUNT":
        return b.amount - a.amount;
      case "NEWEST":
      default:
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });

  // Pagination metadata (chỉ meaningful khi query 1 type)
  const pagination = results[0]?.data?.pagination;

  // Tổng số record (để hiện badge)
  const total = results.reduce(
    (sum, r) => sum + (r.data?.pagination.total ?? 0),
    0
  );

  return {
    transactions,
    pagination,
    total,
    isLoading,
    isError,
    error,
    refetch: () => results.forEach((r) => r.refetch()),
  };
}
