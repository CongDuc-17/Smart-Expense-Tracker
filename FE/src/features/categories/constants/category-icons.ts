// ============================================================
// CATEGORY ICON CONSTANTS
// Phase 2 — Category Module
//
// Map: icon key (string lưu trong DB) → Lucide React component
//
// LÝ DO THIẾT KẾ:
// - DB lưu string key (e.g. "utensils"), không lưu component
// - File này làm nhiệm vụ "registry" để resolve component từ key
// - Dùng dynamic import pattern để tree-shaking hoạt động tốt
//
// REUSABLE: File này sẽ được tái sử dụng ở Phase 3 (hiển thị
// icon category trong transaction rows) và Phase 5 (Budget).
// ============================================================

import {
  Utensils,
  Car,
  Heart,
  ShoppingBag,
  Gamepad2,
  BookOpen,
  Plane,
  Home,
  Briefcase,
  Wallet,
  Gift,
  PiggyBank,
  Dumbbell,
  Coffee,
  PawPrint,
  Smartphone,
  Music,
  Film,
  Shirt,
  Zap,
  Droplets,
  Baby,
  Flower2,
  Bus,
  type LucideIcon,
} from "lucide-react";

// ---------------------------------------------------------------
// Icon Registry Type
// ---------------------------------------------------------------

export interface CategoryIcon {
  /** Key lưu trong DB, e.g. "utensils" */
  key: string;
  /** Lucide React component */
  component: LucideIcon;
  /** Label tiếng Việt — dùng cho aria-label và tooltip */
  label: string;
}

// ---------------------------------------------------------------
// Icon Preset List
// 24 icons phủ rộng nhất các danh mục tài chính phổ biến
// ---------------------------------------------------------------

export const CATEGORY_ICONS: CategoryIcon[] = [
  // ─── Chi tiêu ─────────────────────────────────────────────
  { key: "utensils",     component: Utensils,    label: "Ăn uống" },
  { key: "car",          component: Car,         label: "Xe cộ" },
  { key: "heart",        component: Heart,       label: "Y tế / Sức khỏe" },
  { key: "shopping-bag", component: ShoppingBag, label: "Mua sắm" },
  { key: "gamepad2",     component: Gamepad2,    label: "Giải trí" },
  { key: "book-open",    component: BookOpen,    label: "Học tập" },
  { key: "plane",        component: Plane,       label: "Du lịch" },
  { key: "home",         component: Home,        label: "Nhà ở" },
  { key: "coffee",       component: Coffee,      label: "Cà phê / Đồ uống" },
  { key: "smartphone",   component: Smartphone,  label: "Điện thoại / Tech" },
  { key: "music",        component: Music,       label: "Âm nhạc" },
  { key: "film",         component: Film,        label: "Phim ảnh" },
  { key: "shirt",        component: Shirt,       label: "Quần áo" },
  { key: "zap",          component: Zap,         label: "Điện / Năng lượng" },
  { key: "droplets",     component: Droplets,    label: "Nước" },
  { key: "baby",         component: Baby,        label: "Trẻ em" },
  { key: "flower2",      component: Flower2,     label: "Hoa / Quà tặng" },
  { key: "bus",          component: Bus,         label: "Xe buýt / Công cộng" },
  { key: "paw-print",    component: PawPrint,    label: "Thú cưng" },
  { key: "dumbbell",     component: Dumbbell,    label: "Thể dục / Gym" },

  // ─── Thu nhập ─────────────────────────────────────────────
  { key: "briefcase",    component: Briefcase,   label: "Công việc / Lương" },
  { key: "wallet",       component: Wallet,      label: "Thu nhập khác" },
  { key: "gift",         component: Gift,        label: "Quà tặng nhận" },
  { key: "piggy-bank",   component: PiggyBank,   label: "Tiết kiệm / Đầu tư" },
];

// ---------------------------------------------------------------
// Lookup Map: key → component (O(1) access)
// ---------------------------------------------------------------

export const ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  CATEGORY_ICONS.map(({ key, component }) => [key, component])
);

/**
 * Lấy Lucide component từ icon key.
 * Trả về Wallet làm fallback nếu key không tồn tại.
 */
export function getIconComponent(key: string): LucideIcon {
  return ICON_MAP[key] ?? Wallet;
}

/** Icon key mặc định khi user chưa chọn */
export const DEFAULT_CATEGORY_ICON = "utensils";
