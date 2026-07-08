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

	// Handle unexpected errors (not TSed Exceptions)
	console.error('Unhandled Exception:', err);
	res.status(500).json({
		success: false,
		message: err instanceof Error ? err.message : 'Internal Server Error',
	});
};
