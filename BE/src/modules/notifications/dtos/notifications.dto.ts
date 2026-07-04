import { z } from 'zod';
import { NotificationTypeEnum } from '@prisma/client';
import { PaginationSchema, ZodValidationSchema } from '@/common';

export const getNotificationsQueryObjectSchema = z.object({
	isRead: z
		.string()
		.optional()
		.transform((val) => {
			if (val === 'true') return true;
			if (val === 'false') return false;
			return undefined;
		}),
	page: z.coerce.number().int().positive().optional().default(1),
	limit: z.coerce.number().int().positive().optional().default(10),
});

export const getNotificationsQueryValidationSchema: ZodValidationSchema = {
	query: getNotificationsQueryObjectSchema,
};

export const notificationIdParamObjectSchema = z.object({
	id: z.string().cuid(),
});

export const notificationIdParamValidationSchema: ZodValidationSchema = {
	params: notificationIdParamObjectSchema,
};

export const notificationResponseSchema = z.object({
	id: z.string(),
	title: z.string(),
	message: z.string(),
	type: z.nativeEnum(NotificationTypeEnum),
	isRead: z.boolean(),
	metadata: z.any().nullable(),
	createdAt: z.date(),
});

// Internal DTO for service
export interface CreateNotificationInternalDTO {
	userId: string;
	title: string;
	message: string;
	type: NotificationTypeEnum;
	metadata?: any;
}
