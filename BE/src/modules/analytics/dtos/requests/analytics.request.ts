import z from 'zod';
import { ZodValidationSchema } from '@/common';

export const analyticsQueryObjectSchema = z.object({
	month: z.coerce.number().int().min(1).max(12),
	year: z.coerce.number().int().min(2020).max(2100),
});

export const analyticsQueryValidationSchema: ZodValidationSchema = {
	query: analyticsQueryObjectSchema,
};
