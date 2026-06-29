// ============================================================
// CategoryGrid — Layout Component
// Phase 2 — Category Module
//
// Nhận danh sách đã được filter (từ CategoriesPage),
// tách thành 2 sections và render.
// ============================================================

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { CategoryCard } from "@/features/categories/components/CategoryCard";
import { CategoryEmptyState } from "@/features/categories/components/CategoryEmptyState";
import { Badge } from "@/components/ui/badge";
import type { Category } from "@/features/categories/types/category.types";

// ---------------------------------------------------------------
// Props
// ---------------------------------------------------------------

interface CategoryGridProps {
  /** Danh sách category đã được filter ở CategoriesPage */
  categories: Category[];
  /** Đang search/filter không (để show đúng empty state) */
  isFiltered: boolean;
  /** Callbacks lên parent */
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onCreateClick: () => void;
}

// ---------------------------------------------------------------
// Animation variants — stagger children
// ---------------------------------------------------------------

const containerVariants = {
  hidden: {},
  visible: {
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
    transition: { duration: 0.2, ease: "easeOut" },
  },
};

// ---------------------------------------------------------------
// Section Header
// ---------------------------------------------------------------

interface SectionHeaderProps {
  title: string;
  badge?: string;
  isDefault?: boolean;
}

function SectionHeader({ title, badge, isDefault }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <h2 className="text-xs font-semibold text-[#9B9A97] uppercase tracking-wider leading-4">
        {title}
      </h2>
      {badge && isDefault && (
        <Badge
          className="
            text-[10px] font-medium px-1.5 py-0 rounded-full h-4
            bg-[#37352F] text-[#FFFEFC]
          "
        >
          <ShieldCheck className="w-2.5 h-2.5 mr-0.5 inline-block" />
          {badge}
        </Badge>
      )}
      {badge && !isDefault && (
        <Badge
          variant="secondary"
          className="
            text-[10px] font-medium px-1.5 py-0 rounded-full h-4
            bg-[#F7F6F3] text-[#9B9A97] border border-[#E8E7E5]
          "
        >
          {badge}
        </Badge>
      )}
    </div>
  );
}

// ---------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------

export function CategoryGrid({
  categories,
  isFiltered,
  onEdit,
  onDelete,
  onCreateClick,
}: CategoryGridProps) {
  // Tách default và user categories
  const { defaultCategories, userCategories } = useMemo(
    () => ({
      defaultCategories: categories.filter((c) => c.isDefault),
      userCategories: categories.filter((c) => !c.isDefault),
    }),
    [categories]
  );

  // Không có category nào sau filter
  if (categories.length === 0) {
    return (
      <CategoryEmptyState
        variant={isFiltered ? "filtered" : "empty"}
        onCreateClick={!isFiltered ? onCreateClick : undefined}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Default Categories Section ──────────────────────── */}
      {defaultCategories.length > 0 && (
        <section aria-label="Danh mục hệ thống">
          <SectionHeader
            title="Danh mục hệ thống"
            badge="Mặc định"
            isDefault
          />
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {defaultCategories.map((category) => (
              <motion.div key={category.id} variants={itemVariants}>
                <CategoryCard category={category} />
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* ── User Categories Section ─────────────────────────── */}
      <section aria-label="Danh mục của tôi">
        <SectionHeader
          title="Danh mục của tôi"
          badge={userCategories.length > 0 ? String(userCategories.length) : undefined}
          isDefault={false}
        />

        {userCategories.length === 0 ? (
          // Empty state chỉ cho user section
          <div className="flex flex-col items-center justify-center py-8 px-4 rounded-lg border border-dashed border-[#E8E7E5] text-center">
            <p className="text-sm text-[#9B9A97] mb-3">
              Bạn chưa tạo danh mục nào
            </p>
            <button
              onClick={onCreateClick}
              className="
                text-sm font-medium text-[#37352F] underline underline-offset-2
                hover:text-[#2D2B27] transition-colors duration-150
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[#37352F] rounded
              "
            >
              Tạo danh mục đầu tiên
            </button>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {userCategories.map((category) => (
              <motion.div key={category.id} variants={itemVariants}>
                <CategoryCard
                  category={category}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}
