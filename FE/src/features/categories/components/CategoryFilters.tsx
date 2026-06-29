// ============================================================
// CategoryFilters — Filter Bar Component
// Phase 2 — Category Module
//
// Tab filter (Tất cả / Thu nhập / Chi tiêu) + Search input.
// Kết nối trực tiếp với Zustand store — không cần callback lên parent.
// ============================================================

import { Search, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useCategoryStore } from "@/features/categories/stores/category.store";
import type { CategoryTabFilter } from "@/features/categories/types/category.types";

// ---------------------------------------------------------------
// Tab config
// ---------------------------------------------------------------

interface TabOption {
  value: CategoryTabFilter;
  label: string;
}

const TAB_OPTIONS: TabOption[] = [
  { value: "ALL",     label: "Tất cả" },
  { value: "INCOME",  label: "Thu nhập" },
  { value: "EXPENSE", label: "Chi tiêu" },
];

// ---------------------------------------------------------------
// Component
// ---------------------------------------------------------------

export function CategoryFilters() {
  const { activeTab, searchQuery, setActiveTab, setSearchQuery } =
    useCategoryStore();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      {/* ── Type Tab Filter ────────────────────────────────── */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as CategoryTabFilter)}
      >
        <TabsList
          className="
            h-9 bg-[#F7F6F3] border border-[#E8E7E5] rounded-lg p-0.5
            gap-0
          "
        >
          {TAB_OPTIONS.map((tab) => (
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
                focus-visible:ring-2 focus-visible:ring-[#37352F]
              "
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* ── Search Input ──────────────────────────────────── */}
      <div className="relative flex-1 w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B9A97] pointer-events-none" />
        <Input
          type="text"
          placeholder="Tìm danh mục..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Tìm kiếm danh mục"
          className="
            h-9 pl-9 pr-8 text-sm
            bg-white border-[#E8E7E5] text-[#37352F]
            placeholder:text-[#9B9A97]
            focus-visible:ring-2 focus-visible:ring-[#37352F]
            focus-visible:border-[#37352F]
            rounded-lg transition-all duration-150
          "
        />
        {/* Clear button — xuất hiện khi có text */}
        {searchQuery && (
          <button
            type="button"
            aria-label="Xóa từ khóa tìm kiếm"
            onClick={() => setSearchQuery("")}
            className="
              absolute right-2.5 top-1/2 -translate-y-1/2
              w-4 h-4 flex items-center justify-center
              text-[#9B9A97] hover:text-[#37352F]
              transition-colors duration-150
            "
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
