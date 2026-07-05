// ============================================================
// BUDGET ZOD SCHEMAS — Frontend Validation
// Phase 5 — Budget Module
//
// Dùng với React Hook Form + zodResolver
// ============================================================

import { z } from "zod";

// ---------------------------------------------------------------
// Create Budget Schema
// ---------------------------------------------------------------

export const createBudgetSchema = z.object({
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
  limitAmount: z
    .number({ message: "Hạn mức phải là số" })
    .positive("Hạn mức phải lớn hơn 0")
    .max(999_999_999_999, "Hạn mức quá lớn"),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
});

export type CreateBudgetFormValues = z.infer<typeof createBudgetSchema>;

// ---------------------------------------------------------------
// Edit Budget Schema
// (Không cho phép đổi categoryId, month, year sau khi tạo)
// ---------------------------------------------------------------

export const editBudgetSchema = z.object({
  limitAmount: z
    .number({ message: "Hạn mức phải là số" })
    .positive("Hạn mức phải lớn hơn 0")
    .max(999_999_999_999, "Hạn mức quá lớn"),
});

export type EditBudgetFormValues = z.infer<typeof editBudgetSchema>;
