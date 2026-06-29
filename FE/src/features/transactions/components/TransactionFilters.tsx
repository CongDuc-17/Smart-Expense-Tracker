// ============================================================
// TransactionFilters — Filter bar
// Phase 3 — Expense & Income Module
//
// Kết nối trực tiếp với Zustand store.
// Components: Tab type + MonthYearPicker + Category dropdown
// ============================================================

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MonthYearPicker } from "@/features/transactions/components/MonthYearPicker";
import { useTransactionStore } from "@/features/transactions/stores/transaction.store";
import type { TransactionTabFilter } from "@/features/transactions/types/transaction.types";

// ---------------------------------------------------------------
// Tab config
// ---------------------------------------------------------------

const TABS: { value: TransactionTabFilter; label: string }[] = [
  { value: "ALL",     label: "Tất cả" },
  { value: "EXPENSE", label: "Chi tiêu" },
  { value: "INCOME",  label: "Thu nhập" },
];

// ---------------------------------------------------------------
// Component
// ---------------------------------------------------------------

export function TransactionFilters() {
  const { activeTab, setActiveTab } = useTransactionStore();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      {/* ── Type Tabs ─────────────────────────────────────── */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as TransactionTabFilter)}
      >
        <TabsList className="h-9 bg-[#F7F6F3] border border-[#E8E7E5] rounded-lg p-0.5 gap-0">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="
                h-8 px-3 text-sm rounded-md font-medium
                text-[#9B9A97] transition-all duration-150
                data-[state=active]:bg-white
                data-[state=active]:text-[#37352F]
                data-[state=active]:shadow-[0_1px_3px_rgba(0,0,0,0.08)]
                hover:text-[#37352F]
              "
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* ── Month/Year Picker ─────────────────────────────── */}
      <MonthYearPicker />
    </div>
  );
}
