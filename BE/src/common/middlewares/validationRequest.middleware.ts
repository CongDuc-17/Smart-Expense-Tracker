import { Exception } from '@tsed/exceptions';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ZodError, ZodSchema } from 'zod';

import { OptionalException } from '../exceptions';

export class ZodValidationSchema {
	body?: ZodSchema;
	params?: ZodSchema;
	query?: ZodSchema;
	cookies?: ZodSchema;
	headers?: ZodSchema | ZodSchema[];
	[key: string]: ZodSchema | ZodSchema[] | undefined;
}

export const validateRequestMiddleware = (schema: ZodValidationSchema) => {
	return (req: Request, res: Response, next: NextFunction): void | Exception => {
		try {
			for (const key in schema) {
				const zodSchema: ZodSchema | ZodSchema[] | undefined =
					schema[key as keyof ZodValidationSchema];
				if (zodSchema && !Array.isArray(zodSchema)) {
					zodSchema.parse(req[key as keyof Request]);
				} else {
					(zodSchema as ZodSchema[]).forEach((zodSchema) => {
						zodSchema.parse(req[key as keyof Request]);
					});
				}
			}

			next();
		} catch (err) {
			const errorMessage = `${(err as ZodError).issues.map((e) => `${e.path.join(', ')} ${e.message}`).join('; ')}`;
			throw new OptionalException(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage);
		}
	};
};
