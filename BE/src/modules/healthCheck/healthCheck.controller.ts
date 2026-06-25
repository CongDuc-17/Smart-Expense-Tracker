import { Response } from 'express';

import { HttpResponseDto } from '@/common';

export class HealthCheckController {
	async start(): Promise<Response> {
		return new HttpResponseDto().success<string>({
			success: true,
			data: 'Service is running',
		});
	}
}
