// ============================================================
// SAVING GOAL SCHEMAS (ZOD)
// Phase 6 — Saving Goals Module
// Dùng cho React Hook Form validation
// ============================================================

import { z } from "zod";

export const createSavingGoalSchema = z.object({
  title: z.string().min(2, "Tiêu đề phải có ít nhất 2 ký tự").max(100, "Tiêu đề tối đa 100 ký tự"),
  targetAmount: z
    .number({ message: "Số tiền không hợp lệ" })
    .positive("Số tiền mục tiêu phải lớn hơn 0")
    .max(10000000000, "Số tiền không được vượt quá 10 tỷ"),
  deadline: z.string().nullable().optional(),
  note: z.string().max(500, "Ghi chú tối đa 500 ký tự").optional().nullable(),
});

export type CreateSavingGoalFormValues = z.infer<typeof createSavingGoalSchema>;

export const updateSavingGoalSchema = z.object({
  title: z.string().min(2, "Tiêu đề phải có ít nhất 2 ký tự").max(100, "Tiêu đề tối đa 100 ký tự").optional(),
  targetAmount: z
    .number({ message: "Số tiền không hợp lệ" })
    .positive("Số tiền mục tiêu phải lớn hơn 0")
    .max(10000000000, "Số tiền không được vượt quá 10 tỷ")
    .optional(),
  deadline: z.string().nullable().optional(),
  note: z.string().max(500, "Ghi chú tối đa 500 ký tự").optional().nullable(),
}).refine(data => Object.keys(data).length > 0, {
  message: "Cần ít nhất một trường để cập nhật"
});

export type UpdateSavingGoalFormValues = z.infer<typeof updateSavingGoalSchema>;

export const depositSavingGoalSchema = z.object({
  amount: z
    .number({ message: "Số tiền không hợp lệ" })
    .positive("Số tiền nạp phải lớn hơn 0")
    .max(10000000000, "Số tiền không được vượt quá 10 tỷ"),
  note: z.string().max(200, "Ghi chú tối đa 200 ký tự").optional().nullable(),
});

export type DepositSavingGoalFormValues = z.infer<typeof depositSavingGoalSchema>;
