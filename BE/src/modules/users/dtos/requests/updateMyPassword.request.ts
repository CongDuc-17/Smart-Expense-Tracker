import z from 'zod';

import { ZodValidationSchema } from '@/common/middlewares/validationRequest.middleware';

export class UpdateMyPasswordRequestDto {
	newPassword: string;

	constructor(data: UpdateMyPasswordRequestDto) {
		this.newPassword = data.newPassword;
	}
}

const updateMyPasswordRequestBody = z
	.object({
		newPassword: z.string().min(8),
	})
	.strict();

export const updateMyPasswordRequestValidationSchema: ZodValidationSchema = {
	body: updateMyPasswordRequestBody,
};

export const updateMyPasswordRequestSchema = {
	body: {
		description: 'Request body for updating user password',
		content: {
			'application/json': {
				schema: updateMyPasswordRequestBody,
			},
		},
	},
};
