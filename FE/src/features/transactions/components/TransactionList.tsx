// ============================================================
// TransactionList — Grouped transaction list
// Phase 3 — Expense & Income Module
//
// Group by date: "Hôm nay", "Hôm qua", hoặc ngày cụ thể.
// Mỗi group hiện tổng thu/chi của ngày đó.
// ============================================================

import { useMemo } from "react";
import { motion } from "framer-motion";
import { TransactionCard } from "@/features/transactions/components/TransactionCard";
import { formatVND } from "@/features/transactions/components/AmountDisplay";
import type { Transaction } from "@/features/transactions/types/transaction.types";

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------

function getDateLabel(isoString: string): string {
  const date = new Date(isoString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (isSameDay(date, today)) return "Hôm nay";
  if (isSameDay(date, yesterday)) return "Hôm qua";

  return date.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getDateKey(isoString: string): string {
  return new Date(isoString).toDateString(); // e.g. "Sun Jun 28 2026"
}

interface DayGroup {
  label: string;
  dateKey: string;
  transactions: Transaction[];
  dayIncome: number;
  dayExpense: number;
}

function groupByDate(transactions: Transaction[]): DayGroup[] {
  const map = new Map<string, DayGroup>();

  for (const t of transactions) {
    const key = getDateKey(t.date);
    if (!map.has(key)) {
      map.set(key, {
        label: getDateLabel(t.date),
        dateKey: key,
        transactions: [],
        dayIncome: 0,
        dayExpense: 0,
      });
    }
    const group = map.get(key)!;
    group.transactions.push(t);
    if (t.type === "INCOME") group.dayIncome += t.amount;
    else group.dayExpense += t.amount;
  }

  return Array.from(map.values());
}

// ---------------------------------------------------------------
// Animation
// ---------------------------------------------------------------

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.03 } },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.18, ease: "easeOut" as const } },
} as const;

// ---------------------------------------------------------------
// Props
// ---------------------------------------------------------------

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

// ---------------------------------------------------------------
// Component
// ---------------------------------------------------------------

export function TransactionList({
  transactions,
  onEdit,
  onDelete,
}: TransactionListProps) {
  const groups = useMemo(() => groupByDate(transactions), [transactions]);

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.dateKey} aria-label={group.label}>
          {/* Date group header */}
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-xs font-semibold text-[#9B9A97] uppercase tracking-wider leading-4">
              {group.label}
            </h3>
            <div className="flex items-center gap-3 text-xs text-[#9B9A97]">
              {group.dayIncome > 0 && (
                <span className="text-[#1DD1A1] font-medium">
                  +{formatVND(group.dayIncome)}
                </span>
              )}
              {group.dayExpense > 0 && (
                <span className="text-[#FF6B6B] font-medium">
                  -{formatVND(group.dayExpense)}
                </span>
              )}
            </div>
          </div>

          {/* Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-2"
          >
            {group.transactions.map((t) => (
              <motion.div key={t.id} variants={itemVariants}>
                <TransactionCard
                  transaction={t}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </motion.div>
            ))}
          </motion.div>
        </section>
      ))}
    </div>
  );
}
