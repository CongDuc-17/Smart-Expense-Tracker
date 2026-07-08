import { z } from 'zod';

import { ZodValidationSchema } from '@/common';

export const uploadContextEnum = z.enum(['expense', 'avatar', 'ocr']);

export const uploadImageQueryObjectSchema = z.object({
	context: uploadContextEnum.optional().default('expense'),
});

export const uploadImageValidationSchema: ZodValidationSchema = {
	query: uploadImageQueryObjectSchema,
};

export const uploadResponseSchema = z.object({
	url: z.string(),
	publicId: z.string(),
	width: z.number(),
	height: z.number(),
	format: z.string(),
	bytes: z.number(),
});
