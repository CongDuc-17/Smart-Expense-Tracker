import { extendZodWithOpenApi, ResponseConfig } from '@asteasolutions/zod-to-openapi';
import { ReferenceObject } from '@asteasolutions/zod-to-openapi/dist/types';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import { ServiceResponseSchema } from '../common';

extendZodWithOpenApi(z);

export const createApiResponse = (
	schema: z.ZodTypeAny | null,
	description: string,
	statusCode = StatusCodes.OK,
): {
	[statusCode: string]: ResponseConfig | ReferenceObject;
} => {
	return {
		[statusCode]: {
			description,
			content: {
				'application/json': {
					schema: ServiceResponseSchema(schema),
				},
			},
		},
	};
};
