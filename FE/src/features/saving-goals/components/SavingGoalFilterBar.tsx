
import { Search, ListFilter, ArrowDownUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";

export type SavingFilterType = "ALL" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE";
export type SavingSortType = "ALMOST_DONE" | "DEADLINE_NEAR" | "AMOUNT_HIGH" | "NEWEST";

interface SavingGoalFilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  filterType: SavingFilterType;
  onFilterChange: (val: SavingFilterType) => void;
  sortType: SavingSortType;
  onSortChange: (val: SavingSortType) => void;
  disabled?: boolean;
}

export function SavingGoalFilterBar({
  searchQuery,
  onSearchChange,
  filterType,
  onFilterChange,
  sortType,
  onSortChange,
  disabled
}: SavingGoalFilterBarProps) {
  const FILTER_OPTIONS: { value: SavingFilterType; label: string }[] = [
    { value: "ALL", label: "Tất cả" },
    { value: "IN_PROGRESS", label: "Đang thực hiện" },
    { value: "COMPLETED", label: "Hoàn thành" },
    { value: "OVERDUE", label: "Quá hạn" },
  ];

  const SORT_OPTIONS: { value: SavingSortType; label: string }[] = [
    { value: "ALMOST_DONE", label: "Sắp hoàn thành" },
    { value: "DEADLINE_NEAR", label: "Deadline gần" },
    { value: "AMOUNT_HIGH", label: "Giá trị cao" },
    { value: "NEWEST", label: "Mới tạo" },
  ];

  const selectedFilterLabel = FILTER_OPTIONS.find(o => o.value === filterType)?.label || "Tất cả";
  const selectedSortLabel = SORT_OPTIONS.find(o => o.value === sortType)?.label || "Sắp xếp";

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Tìm mục tiêu..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          disabled={disabled}
          className="pl-9 h-9 bg-card border-border text-sm focus-visible:ring-ring focus-visible:border-ring w-full"
        />
      </div>

      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={disabled}
              className="h-9 bg-card border-border text-foreground hover:bg-muted flex-1 sm:flex-none"
            >
              <ListFilter className="w-4 h-4 mr-2 text-muted-foreground" />
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
                      filterType === opt.value ? "bg-muted font-medium" : ""
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
              className="h-9 bg-card border-border text-foreground hover:bg-muted flex-1 sm:flex-none"
            >
              <ArrowDownUp className="w-4 h-4 mr-2 text-muted-foreground" />
              {selectedSortLabel}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[180px] p-0" align="end">
            <Command>
              <CommandGroup>
                {SORT_OPTIONS.map((opt) => (
                  <CommandItem
                    key={opt.value}
                    onSelect={() => onSortChange(opt.value)}
                    className={cn(
                      "text-sm cursor-pointer",
                      sortType === opt.value ? "bg-muted font-medium" : ""
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
