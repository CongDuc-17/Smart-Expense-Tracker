import z from 'zod';

import { ZodValidationSchema } from '@/common';

export class SendOtpRequestDto {
	email: string;

	constructor(data: SendOtpRequestDto) {
		this.email = data.email;
	}
}

const sendOtpRequestBodySchema = z.object({
	email: z.email(),
});

export const sendOtpRequestValidationSchema: ZodValidationSchema = {
	body: sendOtpRequestBodySchema,
};

export const sendOtpRequestSchema = {
	body: {
		description: 'Send OTP to email for verification',
		content: {
			'application/json': {
				schema: sendOtpRequestBodySchema,
			},
		},
	},
};
