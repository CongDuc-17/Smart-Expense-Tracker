import { HTTPException } from '@tsed/exceptions';
import { Response, CookieOptions } from 'express';
import { StatusCodes } from 'http-status-codes';
import { appEnv } from '@/configs';

import { getResponse } from '../utils';

import { HttpResponseBodySuccessDto } from './httpResponseBodySuccess.dto';

export class HttpResponseDto {
	async success<T>(data: HttpResponseBodySuccessDto<T>): Promise<Response> {
		const res = getResponse();
		this.setCookies(res, data.cookies);
		return res.status(StatusCodes.OK).json(data);
	}

	async created<T>(data: HttpResponseBodySuccessDto<T>): Promise<Response> {
		const res = getResponse();
		this.setCookies(res, data.cookies);
		return res.status(StatusCodes.CREATED).json(data);
	}

	private setCookies(res: Response, cookies?: Record<string, any>) {
		if (!cookies) return;
		const isProduction = appEnv.NODE_ENV === 'production';
		Object.entries(cookies).forEach(([name, value]) => {
			const options: CookieOptions = {
				httpOnly: true,
				secure: isProduction,
				sameSite: isProduction ? 'none' : 'lax',
				path: '/',
			};
			if (value === '') {
				res.clearCookie(name, options);
			} else {
				res.cookie(name, String(value), options);
			}
		});
	}

	async exception(exceptions: HTTPException): Promise<Response> {
		const res = getResponse();
		return res.status(exceptions.status).json({
			success: false,
			message: exceptions.message,
		});
	}
}
