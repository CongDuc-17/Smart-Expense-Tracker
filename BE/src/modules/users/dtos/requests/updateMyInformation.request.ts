import z from 'zod';

import { ZodValidationSchema } from '@/common';

export class UpdateMyInformationRequestDto {
	name?: string;
	email?: string;
	avatar?: string;
	avatarPublicId?: string;

	constructor(data: Partial<UpdateMyInformationRequestDto> = {}) {
		this.name = data.name;
		this.email = data.email;
		this.avatar = data.avatar;
		this.avatarPublicId = data.avatarPublicId;
	}
}

const emptyStringToUndefined = (val: unknown) => {
	if (typeof val === 'string' && val.trim() === '') {
		return undefined;
	}
	return val;
};

const updateMyInformationRequestBody = z
	.object({
		name: z.preprocess(emptyStringToUndefined, z.string().optional()),
		email: z.preprocess(emptyStringToUndefined, z.string().email().optional()),
		avatar: z.any().optional(),
		avatarPublicId: z.string().optional(),
	})
	.strict();

export const updateMyInformationRequestValidationSchema: ZodValidationSchema = {
	body: updateMyInformationRequestBody,
};

const swaggerMultipartSchema = z.object({
	name: z.string().optional(),
	email: z.string().email().optional(),
	avatar: z
		.string()
		.openapi({
			format: 'binary',
			description: 'Optional avatar image file',
		})
		.optional(),
});

export const updateMyInformationRequestSchema = {
	body: {
		description: 'Update my information with optional avatar',
		content: {
			'multipart/form-data': {
				schema: swaggerMultipartSchema,
			},
		},
	},
};
