import { z, ZodObject } from 'zod';

class PaginationDto {
	totalItems: number;
	itemsPerPage: number;
	currentPage: number;
	totalPages: number;
}

export class HttpResponseBodySuccessDto<T> {
	success?: boolean = true;
	data: T;
	pagination?: PaginationDto;
	totalPage?: PaginationDto;
	cookies?: Record<string, string | number | boolean | object>;
}

export const HttpResponseBodySuccessDtoSchema = <T extends z.ZodTypeAny>(
	dataSchema: T,
	paginationSchema: z.ZodTypeAny,
): ZodObject =>
	z.object({
		success: z.boolean().optional().default(true),
		data: dataSchema,
		pagination: paginationSchema ? paginationSchema.optional() : z.undefined(),
	});
