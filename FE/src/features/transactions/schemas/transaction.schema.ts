// ============================================================
// TRANSACTION VALIDATION SCHEMAS
// Phase 3 — Expense & Income Module
//
// Dùng với React Hook Form + zodResolver.
// Tách Create / Edit vì có rules khác nhau (type disabled trong edit).
// ============================================================

import { z } from "zod";

// ---------------------------------------------------------------
// Create Transaction Schema
// ---------------------------------------------------------------

export const createTransactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"], {
    message: "Vui lòng chọn loại giao dịch",
  }),
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
  amount: z
    .number({ message: "Số tiền phải là số" })
    .positive("Số tiền phải lớn hơn 0")
    .max(999_999_999_999, "Số tiền quá lớn"),
  title: z
    .string()
    .min(2, "Tiêu đề quá ngắn (tối thiểu 2 ký tự)")
    .max(255, "Tiêu đề quá dài (tối đa 255 ký tự)"),
  date: z.string().min(1, "Vui lòng chọn ngày"),
  note: z.string().max(1000, "Ghi chú quá dài").optional(),
});

export type CreateTransactionFormValues = z.infer<typeof createTransactionSchema>;

// ---------------------------------------------------------------
// Edit Transaction Schema
// (type không có trong form — bị disabled và lấy từ editingTransaction)
// ---------------------------------------------------------------

export const editTransactionSchema = z.object({
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
  amount: z
    .number({ message: "Số tiền phải là số" })
    .positive("Số tiền phải lớn hơn 0")
    .max(999_999_999_999, "Số tiền quá lớn"),
  title: z
    .string()
    .min(2, "Tiêu đề quá ngắn (tối thiểu 2 ký tự)")
    .max(255, "Tiêu đề quá dài (tối đa 255 ký tự)"),
  date: z.string().min(1, "Vui lòng chọn ngày"),
  note: z.string().max(1000, "Ghi chú quá dài").optional(),
});

export type EditTransactionFormValues = z.infer<typeof editTransactionSchema>;
