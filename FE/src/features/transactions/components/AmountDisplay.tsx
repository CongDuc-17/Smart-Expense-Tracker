// ============================================================
// AmountDisplay — Format & hiển thị số tiền VND
// Phase 3 — Expense & Income Module
//
// Reusable ở TransactionCard, Sheet preview, Summary bar.
// ============================================================

import { cn } from "@/lib/utils";
import type { TransactionType } from "@/features/transactions/types/transaction.types";

// ---------------------------------------------------------------
// Formatter
// ---------------------------------------------------------------

const VND_FORMATTER = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatVND(amount: number): string {
  return VND_FORMATTER.format(amount);
}

// ---------------------------------------------------------------
// Component
// ---------------------------------------------------------------

interface AmountDisplayProps {
  amount: number;
  type: TransactionType;
  size?: "sm" | "md" | "lg";
  showSign?: boolean;
  className?: string;
}

const SIZE_CLASSES = {
  sm: "text-sm font-medium",
  md: "text-base font-semibold",
  lg: "text-xl font-bold tracking-tight",
};

export function AmountDisplay({
  amount,
  type,
  size = "md",
  showSign = true,
  className,
}: AmountDisplayProps) {
  const isIncome = type === "INCOME";
  const sign = showSign ? (isIncome ? "+" : "-") : "";

  return (
    <span
      className={cn(
        SIZE_CLASSES[size],
        isIncome ? "text-[#1DD1A1]" : "text-[#FF6B6B]",
        className
      )}
    >
      {sign}{formatVND(amount)}
    </span>
  );
}
