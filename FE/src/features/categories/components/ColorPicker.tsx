// ============================================================
// ColorPicker — Reusable Controlled Component
// Phase 2 — Category Module
//
// Fully controlled: nhận value + onChange từ parent.
// Không có internal state.
// REUSABLE: Sẽ dùng lại ở Phase 5 (Budget color).
// ============================================================

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { CATEGORY_COLORS } from "@/features/categories/constants/category-colors";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------
// Props
// ---------------------------------------------------------------

interface ColorPickerProps {
  /** Hex color value hiện tại đang được chọn */
  value: string;
  /** Callback khi user chọn màu mới */
  onChange: (color: string) => void;
  /** ARIA label cho radiogroup container */
  label?: string;
}

// ---------------------------------------------------------------
// Component
// ---------------------------------------------------------------

export function ColorPicker({
  value,
  onChange,
  label = "Chọn màu sắc",
}: ColorPickerProps) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex flex-wrap gap-2"
    >
      {CATEGORY_COLORS.map((color) => {
        const isSelected = value === color.value;

        return (
          <motion.button
            key={color.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={color.label}
            title={color.label}
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange(color.value)}
            className={cn(
              // Base: circle button 32x32
              "relative w-8 h-8 rounded-full flex items-center justify-center",
              "transition-all duration-150 cursor-pointer",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring",
              // Selected: thêm ring ngoài
              isSelected && "ring-2 ring-offset-2 ring-ring"
            )}
            style={{ backgroundColor: color.value }}
          >
            {/* Checkmark khi selected */}
            {isSelected && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                <Check
                  className="w-3.5 h-3.5 text-primary-foreground drop-shadow-sm"
                  strokeWidth={3}
                />
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
