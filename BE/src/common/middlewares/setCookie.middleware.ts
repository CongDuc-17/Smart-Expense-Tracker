import { RequestHandler, Response } from 'express';

import { appEnv } from '@/configs';

export interface ICookieOptions {
	httpOnly?: boolean;
	secure?: boolean;
	sameSite?: 'strict' | 'lax' | 'none';
	maxAge?: number; // milliseconds
	expires?: Date;
	domain?: string;
	path?: string;
}

export const setCookieMiddleware: RequestHandler = (req, res, next): void => {
	const originalJson = res.json;

	res.json = function (data: unknown): Response {
		if (data && typeof data === 'object' && 'cookies' in data) {
			const { cookies, ...restData } = data as {
				cookies: Record<string, unknown>;
				[key: string]: unknown;
			};

			Object.keys(cookies).forEach((name) => {
				const cookieValue = cookies[name];

				const defaultOptions: ICookieOptions = {
					httpOnly: true,
					secure: appEnv.NODE_ENV === 'production',
					sameSite: 'lax',
					path: '/',
				};

				this.cookie(name, String(cookieValue), defaultOptions);
			});

			return originalJson.call(this, restData);
		}

		return originalJson.call(this, data);
	};

	next();
};
