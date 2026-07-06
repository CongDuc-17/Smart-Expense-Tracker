// ============================================================
// IconPicker — Reusable Controlled Component
// Phase 2 — Category Module
//
// Fully controlled: nhận value + onChange từ parent.
// Grid 5 cột, keyboard navigable (arrow keys).
// REUSABLE: Sẽ dùng lại ở Phase 5 (Budget icon).
// ============================================================

import { useRef } from "react";
import type { KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { CATEGORY_ICONS, getIconComponent } from "@/features/categories/constants/category-icons";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------
// Props
// ---------------------------------------------------------------

interface IconPickerProps {
  /** Icon key hiện tại đang được chọn (e.g. "utensils") */
  value: string;
  /** Callback khi user chọn icon mới */
  onChange: (iconKey: string) => void;
  /** Color hiện tại — icon được chọn sẽ hiện với màu này */
  selectedColor?: string;
}

// ---------------------------------------------------------------
// Component
// ---------------------------------------------------------------

const COLS = 6; // Số cột trong grid

export function IconPicker({
  value,
  onChange,
  selectedColor = "#37352F",
}: IconPickerProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  // ─── Keyboard Navigation (Arrow Keys) ─────────────────────
  const handleKeyDown = (
    e: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number
  ) => {
    let nextIndex = currentIndex;

    switch (e.key) {
      case "ArrowRight":
        nextIndex = Math.min(currentIndex + 1, CATEGORY_ICONS.length - 1);
        break;
      case "ArrowLeft":
        nextIndex = Math.max(currentIndex - 1, 0);
        break;
      case "ArrowDown":
        nextIndex = Math.min(currentIndex + COLS, CATEGORY_ICONS.length - 1);
        break;
      case "ArrowUp":
        nextIndex = Math.max(currentIndex - COLS, 0);
        break;
      default:
        return;
    }

    e.preventDefault();
    const buttons = gridRef.current?.querySelectorAll<HTMLButtonElement>("button");
    buttons?.[nextIndex]?.focus();
  };

  return (
    <div
      ref={gridRef}
      role="radiogroup"
      aria-label="Chọn biểu tượng"
      className="grid grid-cols-6 gap-1.5"
    >
      {CATEGORY_ICONS.map((iconDef, index) => {
        const IconComponent = iconDef.component;
        const isSelected = value === iconDef.key;

        return (
          <motion.button
            key={iconDef.key}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={iconDef.label}
            title={iconDef.label}
            whileTap={{ scale: 0.85 }}
            onClick={() => onChange(iconDef.key)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              // Base: square button với icon centered
              "w-9 h-9 rounded-lg flex items-center justify-center",
              "transition-all duration-150 cursor-pointer",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
              // Default state
              !isSelected && "bg-muted hover:bg-secondary text-foreground",
              // Selected state
              isSelected && "text-primary-foreground"
            )}
            style={
              isSelected
                ? { backgroundColor: selectedColor }
                : undefined
            }
          >
            <IconComponent className="w-4 h-4" />
          </motion.button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------
// IconDisplay — Utility component để hiển thị icon từ key
// Dùng ở CategoryCard, CategoryPreview, Expense list (Phase 3)
// ---------------------------------------------------------------

interface IconDisplayProps {
  /** Icon key từ DB, e.g. "utensils" */
  iconKey: string;
  /** Màu icon */
  color?: string;
  /** Kích thước container */
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_MAP = {
  sm: { container: "w-7 h-7 rounded-lg", icon: "w-3.5 h-3.5" },
  md: { container: "w-9 h-9 rounded-xl", icon: "w-4 h-4" },
  lg: { container: "w-12 h-12 rounded-xl", icon: "w-6 h-6" },
};

export function IconDisplay({
  iconKey,
  color = "#37352F",
  size = "md",
  className,
}: IconDisplayProps) {
  const IconComponent = getIconComponent(iconKey);
  const sizes = SIZE_MAP[size];

  return (
    <div
      className={cn(
        "flex items-center justify-center flex-shrink-0",
        sizes.container,
        className
      )}
      style={{ backgroundColor: `${color}20` }} // 20% opacity background
    >
      <IconComponent
        className={sizes.icon}
        style={{ color }}
      />
    </div>
  );
}
