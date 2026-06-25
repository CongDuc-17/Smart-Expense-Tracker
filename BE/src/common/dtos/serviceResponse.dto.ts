import { z, ZodObject } from 'zod';

export enum ResponseStatus {
	Success,
	Failed,
}

export class ServiceResponse<T = null> {
	success: boolean;
	message: string;
	data: T;
	code: number;

	constructor(status: ResponseStatus, message: string, data: T, code: number) {
		this.success = status === ResponseStatus.Success;
		this.message = message;
		this.data = data;
		this.code = code;
	}
}

export const ServiceResponseSchema = <T extends z.ZodTypeAny>(
	dataSchema: T | null,
): ZodObject =>
	z.object({
		success: z.boolean(),
		data: dataSchema ? dataSchema.optional() : z.null(),
	});
