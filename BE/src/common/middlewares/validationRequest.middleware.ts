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
					const parsed = zodSchema.parse(req[key as keyof Request]);
					Object.defineProperty(req, key, {
						value: parsed,
						configurable: true,
						writable: true,
						enumerable: true
					});
				} else {
					(zodSchema as ZodSchema[]).forEach((schema) => {
						const parsed = schema.parse(req[key as keyof Request]);
						Object.defineProperty(req, key, {
							value: parsed,
							configurable: true,
							writable: true,
							enumerable: true
						});
					});
				}
			}

			next();
		} catch (err) {
			console.error("VALIDATION ERROR CAUGHT:", err);
			const errorMessage = err instanceof ZodError 
				? `${err.issues.map((e) => `${e.path.join(', ')} ${e.message}`).join('; ')}`
				: (err as any).message || 'Validation error';
			throw new OptionalException(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage);
		}
	};
};
