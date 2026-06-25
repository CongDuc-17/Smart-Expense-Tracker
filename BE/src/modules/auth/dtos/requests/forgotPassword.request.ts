import z from 'zod';

import { ZodValidationSchema } from '@/common';

export class ForgotPasswordRequestDto {
	email: string;
	newPassword: string;
	otp: string;

	constructor(data: ForgotPasswordRequestDto) {
		this.email = data.email;
		this.newPassword = data.newPassword;
		this.otp = data.otp;
	}
}

const forgotPasswordRequestBodySchema = z.object({
	email: z.email(),
	newPassword: z.string().min(8),
	otp: z.string().length(6),
});

export const forgotPasswordRequestValidationSchema: ZodValidationSchema = {
	body: forgotPasswordRequestBodySchema,
};

export const forgotPasswordRequestSchema = {
	body: {
		description: 'Request to reset password',
		content: {
			'application/json': {
				schema: forgotPasswordRequestBodySchema,
			},
		},
	},
};
