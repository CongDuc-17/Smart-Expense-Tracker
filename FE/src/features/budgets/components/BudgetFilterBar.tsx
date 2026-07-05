
import { Search, ListFilter, ArrowDownUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";

export type FilterType = "ALL" | "SAFE" | "WARNING" | "EXCEEDED";
export type SortType = "EXCEEDED_FIRST" | "WARNING_FIRST" | "NAME" | "AMOUNT";

interface BudgetFilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  filterType: FilterType;
  onFilterChange: (val: FilterType) => void;
  sortType: SortType;
  onSortChange: (val: SortType) => void;
  disabled?: boolean;
}

export function BudgetFilterBar({
  searchQuery,
  onSearchChange,
  filterType,
  onFilterChange,
  sortType,
  onSortChange,
  disabled
}: BudgetFilterBarProps) {
  const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
    { value: "ALL", label: "Tất cả" },
    { value: "SAFE", label: "An toàn" },
    { value: "WARNING", label: "Sắp vượt" },
    { value: "EXCEEDED", label: "Đã vượt" },
  ];

  const SORT_OPTIONS: { value: SortType; label: string }[] = [
    { value: "EXCEEDED_FIRST", label: "Vượt nhiều nhất" },
    { value: "WARNING_FIRST", label: "Sắp vượt lên trước" },
    { value: "AMOUNT", label: "Theo số tiền" },
    { value: "NAME", label: "Theo tên" },
  ];

  const selectedFilterLabel = FILTER_OPTIONS.find(o => o.value === filterType)?.label || "Tất cả";
  const selectedSortLabel = SORT_OPTIONS.find(o => o.value === sortType)?.label || "Sắp xếp";

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B9A97]" />
        <Input
          placeholder="Tìm danh mục..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          disabled={disabled}
          className="pl-9 h-9 bg-white border-[#E8E7E5] text-sm focus-visible:ring-[#37352F] focus-visible:border-[#37352F] w-full"
        />
      </div>

      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={disabled}
              className="h-9 bg-white border-[#E8E7E5] text-[#37352F] hover:bg-[#F7F6F3] flex-1 sm:flex-none"
            >
              <ListFilter className="w-4 h-4 mr-2 text-[#9B9A97]" />
              {selectedFilterLabel}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[160px] p-0" align="end">
            <Command>
              <CommandGroup>
                {FILTER_OPTIONS.map((opt) => (
                  <CommandItem
                    key={opt.value}
                    onSelect={() => onFilterChange(opt.value)}
                    className={cn(
                      "text-sm cursor-pointer",
                      filterType === opt.value ? "bg-[#F7F6F3] font-medium" : ""
                    )}
                  >
                    {opt.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={disabled}
              className="h-9 bg-white border-[#E8E7E5] text-[#37352F] hover:bg-[#F7F6F3] flex-1 sm:flex-none"
            >
              <ArrowDownUp className="w-4 h-4 mr-2 text-[#9B9A97]" />
              {selectedSortLabel}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="end">
            <Command>
              <CommandGroup>
                {SORT_OPTIONS.map((opt) => (
                  <CommandItem
                    key={opt.value}
                    onSelect={() => onSortChange(opt.value)}
                    className={cn(
                      "text-sm cursor-pointer",
                      sortType === opt.value ? "bg-[#F7F6F3] font-medium" : ""
                    )}
                  >
                    {opt.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
