import { Request, Response, NextFunction } from 'express';

import { requestContextStorage } from '../utils';

export const requestContextMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction,
): void => {
	requestContextStorage.run({ req, res }, () => {
		next();
	});
};
