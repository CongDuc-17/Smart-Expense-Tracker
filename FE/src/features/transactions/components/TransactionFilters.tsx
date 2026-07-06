// ============================================================
// TransactionFilters — Filter bar
// Phase 3 — Expense & Income Module
//
// Kết nối trực tiếp với Zustand store.
// Components: Tab type + MonthYearPicker + Category dropdown
// ============================================================

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MonthYearPicker } from "@/features/transactions/components/MonthYearPicker";
import { useTransactionStore } from "@/features/transactions/stores/transaction.store";
import type { TransactionTabFilter, TransactionSortMode } from "@/features/transactions/types/transaction.types";

// ---------------------------------------------------------------
// Tab config
// ---------------------------------------------------------------

const TABS: { value: TransactionTabFilter; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "EXPENSE", label: "Chi tiêu" },
  { value: "INCOME", label: "Thu nhập" },
];

// ---------------------------------------------------------------
// Component
// ---------------------------------------------------------------

export function TransactionFilters() {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    sortMode,
    setSortMode
  } = useTransactionStore();

  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, setSearchQuery]);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      {/* ── Type Tabs ─────────────────────────────────────── */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as TransactionTabFilter)}
      >
        <TabsList className="h-9 bg-muted border border-border rounded-lg p-0.5 ">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="
                h-8 px-3 text-sm rounded-md font-medium
                text-muted-foreground transition-all duration-150
                data-[state=active]:bg-background
                data-[state=active]:text-foreground
                data-[state=active]:shadow-[0_1px_3px_rgba(0,0,0,0.08)]
                hover:text-foreground
              "
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex-1 max-w-sm relative">
        <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-muted-foreground" />
        </div>
        <Input
          placeholder="Tìm giao dịch..."
          className="pl-9 h-9 border-border text-sm focus-visible:ring-1 focus-visible:ring-ring"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2">
        <Select value={sortMode} onValueChange={(val) => setSortMode(val as TransactionSortMode)}>
          <SelectTrigger className="h-9 border-border bg-card min-w-[130px] text-sm">
            <SelectValue placeholder="Sắp xếp" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NEWEST">Mới nhất</SelectItem>
            <SelectItem value="OLDEST">Cũ nhất</SelectItem>
            <SelectItem value="HIGHEST_AMOUNT">Giá trị cao</SelectItem>
          </SelectContent>
        </Select>

        {/* ── Month/Year Picker ─────────────────────────────── */}
        <MonthYearPicker />
      </div>
    </div>
  );
}
