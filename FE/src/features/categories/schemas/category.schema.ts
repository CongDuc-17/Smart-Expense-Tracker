// ============================================================
// CATEGORY ZOD SCHEMAS — Frontend Validation
// Phase 2 — Category Module
// Đồng bộ với BE validation nhưng độc lập (FE tự validate trước khi gọi API).
// ============================================================

import { z } from "zod";

// ---------------------------------------------------------------
// Shared enums
// ---------------------------------------------------------------

export const TransactionTypeSchema = z.enum(["INCOME", "EXPENSE"], {
  errorMap: () => ({ message: "Vui lòng chọn loại giao dịch" }),
});

// ---------------------------------------------------------------
// Create Category Schema
// ---------------------------------------------------------------

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Tên danh mục phải có ít nhất 2 ký tự")
    .max(50, "Tên danh mục không được quá 50 ký tự")
    .trim(),

  type: TransactionTypeSchema,

  icon: z
    .string()
    .min(1, "Vui lòng chọn biểu tượng"),

  color: z
    .string()
    .regex(
      /^#[0-9A-Fa-f]{6}$/,
      "Màu sắc phải là định dạng Hex (VD: #FF6B6B)"
    ),
});

export type CreateCategoryFormValues = z.infer<typeof createCategorySchema>;

// ---------------------------------------------------------------
// Edit Category Schema
// Khác Create: không có 'type' (không cho đổi type sau khi tạo)
// ---------------------------------------------------------------

export const editCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Tên danh mục phải có ít nhất 2 ký tự")
    .max(50, "Tên danh mục không được quá 50 ký tự")
    .trim(),

  icon: z
    .string()
    .min(1, "Vui lòng chọn biểu tượng"),

  color: z
    .string()
    .regex(
      /^#[0-9A-Fa-f]{6}$/,
      "Màu sắc phải là định dạng Hex (VD: #FF6B6B)"
    ),
});

export type EditCategoryFormValues = z.infer<typeof editCategorySchema>;
