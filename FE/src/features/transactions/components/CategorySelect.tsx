// ============================================================
// CategorySelect — Dropdown chọn Category theo Type
// Phase 3 — Expense & Income Module
//
// Fully controlled. Tự fetch categories filtered by type.
// Hiển thị icon + màu + tên trong option.
// ============================================================

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { getIconComponent } from "@/features/categories/constants/category-icons";
import type { TransactionType } from "@/features/transactions/types/transaction.types";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------
// Props
// ---------------------------------------------------------------

interface CategorySelectProps {
  /** Type để filter categories (chỉ hiển thị category đúng type) */
  type: TransactionType;
  value: string;
  onChange: (categoryId: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

// ---------------------------------------------------------------
// Component
// ---------------------------------------------------------------

export function CategorySelect({
  type,
  value,
  onChange,
  placeholder = "Chọn danh mục",
  disabled = false,
  error,
}: CategorySelectProps) {
  const { data: categories, isLoading } = useCategories({ type });

  return (
    <div className="space-y-1.5">
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled || isLoading}
      >
        <SelectTrigger
          className={cn(
            "h-9 text-sm bg-white border-[#E8E7E5] text-[#37352F]",
            "focus:ring-2 focus:ring-[#37352F] focus:border-[#37352F]",
            "transition-all duration-150",
            error && "border-red-400 focus:ring-red-400",
            !value && "text-[#9B9A97]"
          )}
        >
          <SelectValue placeholder={isLoading ? "Đang tải..." : placeholder} />
        </SelectTrigger>

        <SelectContent className="bg-white border border-[#E8E7E5] shadow-[0_8px_24px_rgba(0,0,0,0.12)] rounded-lg">
          {categories?.map((category) => {
            const IconComponent = getIconComponent(category.icon);
            return (
              <SelectItem
                key={category.id}
                value={category.id}
                className="
                  text-sm text-[#37352F] cursor-pointer
                  hover:bg-[rgba(55,53,47,0.06)]
                  focus:bg-[rgba(55,53,47,0.06)]
                  rounded-md
                "
              >
                <div className="flex items-center gap-2">
                  {/* Mini icon display */}
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <IconComponent
                      className="w-3 h-3"
                      style={{ color: category.color }}
                    />
                  </div>
                  <span>{category.name}</span>
                </div>
              </SelectItem>
            );
          })}

          {categories?.length === 0 && (
            <div className="py-3 text-center text-sm text-[#9B9A97]">
              Không có danh mục nào
            </div>
          )}
        </SelectContent>
      </Select>

      {error && (
        <p className="text-xs text-red-500 leading-4" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
