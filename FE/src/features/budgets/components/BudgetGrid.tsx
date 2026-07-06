// ============================================================
// BUDGET GRID COMPONENT
// Phase 5 — Budget Module
//
// Lưới hiển thị các thẻ ngân sách. Dùng Framer Motion để tạo hiệu ứng.
// ============================================================

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { BudgetCard } from "@/features/budgets/components/BudgetCard";
import { BudgetFilterBar, type FilterType, type SortType } from "@/features/budgets/components/BudgetFilterBar";
import { useBudgetStore } from "@/features/budgets/stores/budget.store";
import { useDebounce } from "@/hooks/use-debounce";
import type { Budget } from "@/features/budgets/types/budget.types";
import { ChartNoAxesColumn } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2 },
  },
};

interface BudgetGridProps {
  budgets: Budget[];
  isLoading: boolean;
}

export function BudgetGrid({ budgets, isLoading }: BudgetGridProps) {
  const openEditSheet = useBudgetStore((s) => s.openEditSheet);
  const openDeleteDialog = useBudgetStore((s) => s.openDeleteDialog);

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [filterType, setFilterType] = useState<FilterType>("ALL");
  const [sortType, setSortType] = useState<SortType>("EXCEEDED_FIRST");

  const filteredAndSortedBudgets = useMemo(() => {
    let result = [...budgets];

    // 1. Filter
    if (filterType !== "ALL") {
      result = result.filter((b) => {
        if (filterType === "SAFE") return b.alertStatus === "NORMAL";
        if (filterType === "WARNING") return b.alertStatus === "WARNING";
        if (filterType === "EXCEEDED") return b.alertStatus === "EXCEEDED";
        return true;
      });
    }

    // 2. Search
    if (debouncedSearchQuery.trim()) {
      const lowerQuery = debouncedSearchQuery.toLowerCase();
      result = result.filter((b) => b.category.name.toLowerCase().includes(lowerQuery));
    }

    // 3. Sort
    result.sort((a, b) => {
      switch (sortType) {
        case "EXCEEDED_FIRST": {
          // EXCEEDED -> WARNING -> NORMAL
          const score = (status: string) => (status === "EXCEEDED" ? 3 : status === "WARNING" ? 2 : 1);
          return score(b.alertStatus) - score(a.alertStatus) || b.percentage - a.percentage;
        }
        case "WARNING_FIRST": {
          // WARNING -> EXCEEDED -> NORMAL
          const score = (status: string) => (status === "WARNING" ? 3 : status === "EXCEEDED" ? 2 : 1);
          return score(b.alertStatus) - score(a.alertStatus) || b.percentage - a.percentage;
        }
        case "AMOUNT":
          return b.limitAmount - a.limitAmount;
        case "NAME":
          return a.category.name.localeCompare(b.category.name);
        default:
          return 0;
      }
    });

    return result;
  }, [budgets, filterType, debouncedSearchQuery, sortType]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-32 bg-muted rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (budgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-card rounded-xl border border-border shadow-sm">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl"> <ChartNoAxesColumn /></span>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Bạn chưa tạo ngân sách</h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
          Theo dõi ngân sách giúp kiểm soát chi tiêu hiệu quả hơn và tránh được việc vung tay quá trán.
        </p>
        <button
          onClick={() => useBudgetStore.getState().openCreateSheet()}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          + Tạo ngân sách đầu tiên
        </button>
      </div>
    );
  }

  return (
    <div>
      <BudgetFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterType={filterType}
        onFilterChange={setFilterType}
        sortType={sortType}
        onSortChange={setSortType}
      />

      {filteredAndSortedBudgets.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          Không tìm thấy ngân sách nào phù hợp với bộ lọc.
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {filteredAndSortedBudgets.map((budget) => (
            <motion.div key={budget.id} variants={itemVariants}>
              <BudgetCard
                budget={budget}
                onEdit={openEditSheet}
                onDelete={openDeleteDialog}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
