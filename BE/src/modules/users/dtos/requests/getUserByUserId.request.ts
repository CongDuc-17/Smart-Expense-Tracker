import { UserStatusEnum } from '@prisma/client';
import z from 'zod';

import { ZodValidationSchema } from '@/common';

export class GetUserByUserIdRequestDto {
	userId: string;
	status?: UserStatusEnum;

	constructor(userId: string, data: Partial<GetUserByUserIdRequestDto>) {
		this.userId = userId;
		this.status = data?.status;
	}
}
const getUserByUserIdRequestParams = z
	.object({
		userId: z.uuid(),
	})
	.strict();

const getUserByUserIdRequestQuery = z
	.object({
		status: z.nativeEnum(UserStatusEnum).optional(),
	})
	.strict();

export const getUserByUserIdRequestValidationSchema: ZodValidationSchema = {
	params: getUserByUserIdRequestParams,
	query: getUserByUserIdRequestQuery,
};

export const getUserByUserIdRequestSchema = {
	params: getUserByUserIdRequestParams,
	query: getUserByUserIdRequestQuery,
};
