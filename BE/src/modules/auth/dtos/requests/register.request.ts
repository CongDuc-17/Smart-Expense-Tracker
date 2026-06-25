import z from 'zod';

import { ZodValidationSchema } from '@/common';

export class RegisterRequestDto {
	email: string;
	password: string;
	name: string;
}

export const registerRequestValidationSchema: ZodValidationSchema = {
	body: z.object({
		email: z.email(),
		password: z.string().min(8),
		name: z.string().min(2).max(100),
	}),
};

export const registerRequestSchema = {
	body: {
		description: 'Create a new account',
		content: {
			'application/json': {
				schema: registerRequestValidationSchema.body!,
			},
		},
	},
};
