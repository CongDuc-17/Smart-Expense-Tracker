import { z } from 'zod';

import { ZodValidationSchema } from '@/common';

export const exportFormatEnum = z.enum(['pdf', 'excel']);

export const exportReportQueryObjectSchema = z.object({
	month: z.coerce.number().int().min(1).max(12),
	year: z.coerce.number().int().min(2000).max(2100),
	format: exportFormatEnum,
});

export const exportReportValidationSchema: ZodValidationSchema = {
	query: exportReportQueryObjectSchema,
};
