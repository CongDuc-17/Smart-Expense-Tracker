import { TransactionTypeEnum } from '@prisma/client';
import z from 'zod';

import { ZodValidationSchema } from '@/common';

// ─── Shared Schemas ───────────────────────────────────────────────────────────

export const summaryQueryObjectSchema = z.object({
	month: z.coerce.number().int().min(1).max(12),
	year: z.coerce.number().int().min(2020).max(2100),
});

export const summaryQueryValidationSchema: ZodValidationSchema = {
	query: summaryQueryObjectSchema,
};

export const byCategoryQueryObjectSchema = z.object({
	month: z.coerce.number().int().min(1).max(12),
	year: z.coerce.number().int().min(2020).max(2100),
	type: z
		.nativeEnum(TransactionTypeEnum)
		.optional()
		.default(TransactionTypeEnum.EXPENSE),
});

export const byCategoryQueryValidationSchema: ZodValidationSchema = {
	query: byCategoryQueryObjectSchema,
};

export const trendQueryObjectSchema = z.object({
	year: z.coerce.number().int().min(2020).max(2100),
});

export const trendQueryValidationSchema: ZodValidationSchema = {
	query: trendQueryObjectSchema,
};

export const heatmapQueryObjectSchema = z.object({
	year: z.coerce.number().int().min(2020).max(2100),
});

export const heatmapQueryValidationSchema: ZodValidationSchema = {
	query: heatmapQueryObjectSchema,
};

export const topExpensesQueryObjectSchema = z.object({
	month: z.coerce.number().int().min(1).max(12),
	year: z.coerce.number().int().min(2020).max(2100),
	limit: z.coerce.number().int().min(1).max(20).optional().default(5),
});

export const topExpensesQueryValidationSchema: ZodValidationSchema = {
	query: topExpensesQueryObjectSchema,
};
