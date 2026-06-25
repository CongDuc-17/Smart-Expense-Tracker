import z from 'zod';

import { ZodValidationSchema } from '@/common';

export class VerifyRequestDto {
	email: string;
	newPassword: string;
	otp: string;

	constructor(data: VerifyRequestDto) {
		this.email = data.email;
		this.newPassword = data.newPassword;
		this.otp = data.otp;
	}
}

const verifyRequestBodySchema = z.object({
	email: z.email(),
	otp: z.string().length(6),
});

export const verifyRequestValidationSchema: ZodValidationSchema = {
	body: verifyRequestBodySchema,
};

export const verifyRequestSchema = {
	body: {
		description: 'Request to verify account by otp',
		content: {
			'application/json': {
				schema: verifyRequestBodySchema,
			},
		},
	},
};
