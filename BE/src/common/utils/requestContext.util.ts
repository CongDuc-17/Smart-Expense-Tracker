import { AsyncLocalStorage } from 'async_hooks';

import { Request, Response } from 'express';

interface IRequestContext {
	req: Request;
	res: Response;
}

export const requestContextStorage = new AsyncLocalStorage<IRequestContext>();

export const getRequestContext = (): IRequestContext => {
	const context = requestContextStorage.getStore();
	if (!context) {
		throw new Error(
			'Request context not found. Make sure to use the context middleware.',
		);
	}
	return context;
};

export const getResponse = (): Response => {
	return getRequestContext().res;
};

export const getRequest = (): Request => {
	return getRequestContext().req;
};
