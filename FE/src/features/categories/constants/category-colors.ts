// ============================================================
// CATEGORY COLOR CONSTANTS
// Phase 2 — Category Module
//
// 12 màu preset được curate kỹ:
// - Đủ tương phản để phân biệt categories trên chart
// - Không quá sặc sỡ (phù hợp Notion style)
// - Có tên tiếng Việt để accessibility tooltip
// ============================================================

export interface CategoryColor {
  /** Hex color value, e.g. "#FF6B6B" */
  value: string;
  /** Tên màu bằng tiếng Việt — dùng cho aria-label */
  label: string;
}

export const CATEGORY_COLORS: CategoryColor[] = [
  { value: "#FF6B6B", label: "Đỏ San Hô" },
  { value: "#FF9F43", label: "Cam Ấm" },
  { value: "#FECA57", label: "Vàng Nghệ" },
  { value: "#48DBFB", label: "Xanh Lơ" },
  { value: "#1DD1A1", label: "Xanh Ngọc" },
  { value: "#54A0FF", label: "Xanh Dương" },
  { value: "#5F27CD", label: "Tím Đậm" },
  { value: "#C8D6E5", label: "Xanh Xám" },
  { value: "#8395A7", label: "Xám Trung" },
  { value: "#576574", label: "Xám Đậm" },
  { value: "#F368E0", label: "Hồng Tím" },
  { value: "#00D2D3", label: "Ngọc Bích" },
];

/** Màu mặc định khi user chưa chọn */
export const DEFAULT_CATEGORY_COLOR = CATEGORY_COLORS[0].value; // "#FF6B6B"
