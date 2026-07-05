// ============================================================
// TransactionCard — Single transaction row
// Phase 3 — Expense & Income Module
//
// Layout: [Category icon] [title + note] [date] [amount + actions]
// Hover → nút Edit và Delete xuất hiện
// ============================================================

import { memo } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import { IconDisplay } from "@/features/categories/components/IconPicker";
import { AmountDisplay } from "@/features/transactions/components/AmountDisplay";
import type { Transaction } from "@/features/transactions/types/transaction.types";

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------

function formatShortDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });
}

// ---------------------------------------------------------------
// Props
// ---------------------------------------------------------------

interface TransactionCardProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

// ---------------------------------------------------------------
// Animation
// ---------------------------------------------------------------

const actionsVariants = {
  rest: { opacity: 0 },
  hover: { opacity: 1, transition: { duration: 0.15 } },
} as const;

// ---------------------------------------------------------------
// Component
// ---------------------------------------------------------------

export const TransactionCard = memo(function TransactionCard({
  transaction,
  onEdit,
  onDelete,
}: TransactionCardProps) {
  const { category } = transaction;

  return (
    <motion.article
      initial="rest"
      whileHover="hover"
      animate="rest"
      className="
        flex items-center gap-3 px-4 py-3 rounded-lg
        border border-[#E8E7E5] bg-white
        hover:bg-[#F7F6F3] hover:border-[#E8E7E5] hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]
        transition-all duration-200
        cursor-pointer select-none
      "
      onClick={() => onEdit(transaction)}
      aria-label={`${transaction.title}, ${transaction.type === "INCOME" ? "Thu" : "Chi"}`}
    >
      {/* Category icon */}
      <IconDisplay
        iconKey={category.icon}
        color={category.color}
        size="md"
      />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#37352F] truncate leading-5">
          {transaction.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-[#9B9A97] leading-4 truncate">
            {category.name}
          </span>
          <span className="text-[#D0CECA] text-xs">·</span>
          <span className="text-[11px] text-[#9B9A97] leading-4">
            {formatShortDate(transaction.date)}
          </span>
          {transaction.note && (
            <>
              <span className="text-[#D0CECA] text-xs">·</span>
              <span className="text-xs text-[#9B9A97] leading-4 truncate max-w-[120px]">
                {transaction.note}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right: amount + actions */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          {/* Amount */}
          <AmountDisplay
            amount={transaction.amount}
            type={transaction.type}
            size="md"
          />

          {/* Actions — xuất hiện khi hover */}
          <motion.div
            variants={actionsVariants}
            className="flex items-center gap-0.5 ml-2"
          >
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              aria-label={`Xóa ${transaction.title}`}
              onClick={(e) => { e.stopPropagation(); onDelete(transaction); }}
              className="
                w-7 h-7 rounded-md flex items-center justify-center
                text-[#9B9A97] hover:text-red-500
                hover:bg-red-50 hover:border hover:border-red-100
                transition-all duration-150
              "
            >
              <Trash2 className="w-3.5 h-3.5" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.article>
  );
});
