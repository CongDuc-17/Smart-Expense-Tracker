import { z } from 'zod';
import { ZodValidationSchema } from '@/common';
import { UserStatusEnum, RoleEnum } from '@prisma/client';

export const adminGetUsersQuerySchema: ZodValidationSchema = {
	query: z.object({
		page: z.coerce.number().int().min(1).default(1),
		limit: z.coerce.number().int().min(1).max(100).default(20),
		search: z.string().max(100).optional(),
		status: z.nativeEnum(UserStatusEnum).optional(),
		role: z.nativeEnum(RoleEnum).optional(),
	}),
};

export const updateUserStatusSchema: ZodValidationSchema = {
	params: z.object({
		id: z.string().cuid(),
	}),
	body: z.object({
		status: z.nativeEnum(UserStatusEnum),
	}),
};
