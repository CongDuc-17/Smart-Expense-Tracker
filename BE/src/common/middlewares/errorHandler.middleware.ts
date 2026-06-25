import { Exception } from '@tsed/exceptions';
import { Request, Response, NextFunction } from 'express';

import { HttpResponseDto } from '../dtos';

export const errorHandlerMiddleware = (
	err: Exception,
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<Response> | void => {
	if (err instanceof Exception) {
		return new HttpResponseDto().exception(err);
	}
	return next();
};
