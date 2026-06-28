// ============================================================
// CategoryCard — Core Display Component
// Phase 2 — Category Module
//
// Hai variants:
// - Default category: không có actions, tooltip "Danh mục hệ thống"
// - User category: hover → actions Edit / Delete xuất hiện
//
// Wrapped với React.memo để tránh re-render không cần thiết
// khi list lớn.
// ============================================================

import { memo } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IconDisplay } from "@/features/categories/components/IconPicker";
import type { Category } from "@/features/categories/types/category.types";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------
// Props
// ---------------------------------------------------------------

interface CategoryCardProps {
  category: Category;
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
}

// ---------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------

const cardVariants = {
  rest: {
    y: 0,
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },
  hover: {
    y: -2,
    boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
    transition: { duration: 0.2, ease: "easeOut" as const },
  },
} as const;

const actionsVariants = {
  rest: { opacity: 0 },
  hover: { opacity: 1, transition: { duration: 0.15 } },
} as const;

// ---------------------------------------------------------------
// Component
// ---------------------------------------------------------------

export const CategoryCard = memo(function CategoryCard({
  category,
  onEdit,
  onDelete,
}: CategoryCardProps) {
  const isDefault = category.isDefault;
  const isIncome = category.type === "INCOME";

  return (
    <motion.article
      initial="rest"
      whileHover="hover"
      animate="rest"
      variants={cardVariants}
      aria-label={`Danh mục ${category.name}, ${isIncome ? "Thu nhập" : "Chi tiêu"}${isDefault ? ", Danh mục hệ thống" : ""}`}
      className={cn(
        "relative flex items-center gap-3 p-4 rounded-lg border",
        "border-[#E8E7E5] bg-white cursor-default select-none",
        // Default category: slightly different background
        isDefault && "bg-[#FAFAF9]"
      )}
    >
      {/* Icon */}
      <IconDisplay
        iconKey={category.icon}
        color={category.color}
        size="md"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#37352F] truncate leading-5">
          {category.name}
        </p>
        <p className="text-xs text-[#9B9A97] mt-0.5 leading-4">
          {isIncome ? "Thu nhập" : "Chi tiêu"}
        </p>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Default badge với tooltip */}
        {isDefault && (
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                  <Badge
                    variant="secondary"
                    className="
                      text-xs font-medium px-2 py-0.5 rounded-full
                      bg-[#F7F6F3] text-[#9B9A97] border border-[#E8E7E5]
                      cursor-help
                    "
                  >
                    <ShieldCheck className="w-3 h-3 mr-1 inline-block" />
                    Mặc định
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="text-xs bg-[#37352F] text-white border-0 max-w-[200px] text-center"
              >
                Danh mục hệ thống, không thể chỉnh sửa hoặc xóa
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* User category actions — xuất hiện khi hover */}
        {!isDefault && (
          <motion.div
            variants={actionsVariants}
            className="flex items-center gap-0.5"
          >
            {/* Edit button */}
            {onEdit && (
              <motion.button
                type="button"
                aria-label={`Chỉnh sửa danh mục ${category.name}`}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(category);
                }}
                className="
                  w-7 h-7 rounded-md flex items-center justify-center
                  text-[#9B9A97] hover:text-[#37352F]
                  hover:bg-[rgba(55,53,47,0.08)]
                  transition-colors duration-150
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-[#37352F]
                "
              >
                <Pencil className="w-3.5 h-3.5" />
              </motion.button>
            )}

            {/* Delete button */}
            {onDelete && (
              <motion.button
                type="button"
                aria-label={`Xóa danh mục ${category.name}`}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(category);
                }}
                className="
                  w-7 h-7 rounded-md flex items-center justify-center
                  text-[#9B9A97] hover:text-red-500
                  hover:bg-red-50
                  transition-colors duration-150
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400
                "
              >
                <Trash2 className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </motion.div>
        )}
      </div>
    </motion.article>
  );
});
