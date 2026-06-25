import z from 'zod';

import { ZodValidationSchema } from '@/common';

export class LoginRequestDto {
	email: string;
	password: string;
}

export const loginRequestValidationSchema: ZodValidationSchema = {
	body: z.object({
		email: z.email(),
		password: z.string().min(8),
	}),
};

export const loginRequestSchema = {
	body: {
		description: 'Login to your account',
		content: {
			'application/json': {
				schema: loginRequestValidationSchema.body!,
			},
		},
	},
};
