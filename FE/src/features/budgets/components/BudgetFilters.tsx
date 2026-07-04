// ============================================================
// BudgetFilters Component
// Phase 5 — Budget Module
// Filter UI for status, month, year, and search
// ============================================================

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBudgetStore } from "@/features/budgets/stores/budget.store";
import type { BudgetTabFilter } from "@/features/budgets/types/budget.types";

// ---------------------------------------------------------------
// Component
// ---------------------------------------------------------------

export function BudgetFilters() {
  const {
    activeTab,
    searchQuery,
    selectedMonth,
    selectedYear,
    setActiveTab,
    setSearchQuery,
    setSelectedMonth,
    setSelectedYear,
    resetFilters,
  } = useBudgetStore();

  // Current year and months for selects
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // Check if any filter is active
  const isFiltered =
    activeTab !== "ALL" ||
    searchQuery.trim().length > 0 ||
    selectedMonth !== new Date().getMonth() + 1 ||
    selectedYear !== currentYear;

  const tabs: Array<{ value: BudgetTabFilter; label: string }> = [
    { value: "ALL", label: "Tất cả" },
    { value: "HEALTHY", label: "Khỏe mạnh" },
    { value: "WARNING", label: "Cảnh báo" },
    { value: "CRITICAL", label: "Nguy hiểm" },
    { value: "ACTIVE", label: "Hoạt động" },
  ];

  return (
    <div className="space-y-4">
      {/* Status Tabs */}
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as BudgetTabFilter)}>
          <TabsList className="bg-[#F0EEE8] border border-[#E8E7E5]">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="text-xs data-[state=active]:bg-[#37352F] data-[state=active]:text-[#FFFEFC]"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Reset button */}
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-[#37352F] hover:bg-[#E8E7E5] text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Xóa bộ lọc
          </Button>
        )}
      </div>

      {/* Search and Date Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#9B9A97]" />
          <Input
            placeholder="Tìm kiếm ngân sách..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white border-[#E8E7E5] text-[#37352F] placeholder:text-[#9B9A97]"
          />
        </div>

        {/* Month Select */}
        <Select value={selectedMonth.toString()} onValueChange={(val) => setSelectedMonth(parseInt(val))}>
          <SelectTrigger className="w-[140px] bg-white border-[#E8E7E5]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month} value={month.toString()}>
                Tháng {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Year Select */}
        <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(parseInt(val))}>
          <SelectTrigger className="w-[140px] bg-white border-[#E8E7E5]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                Năm {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
