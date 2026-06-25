import { HTTPException } from '@tsed/exceptions';
import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { getResponse } from '../utils';

import { HttpResponseBodySuccessDto } from './httpResponseBodySuccess.dto';

export class HttpResponseDto {
	async success<T>(data: HttpResponseBodySuccessDto<T>): Promise<Response> {
		const res = getResponse();
		return res.status(StatusCodes.OK).json(data);
	}

	async created<T>(data: HttpResponseBodySuccessDto<T>): Promise<Response> {
		const res = getResponse();
		return res.status(StatusCodes.CREATED).json(data);
	}

	async exception(exceptions: HTTPException): Promise<Response> {
		const res = getResponse();
		return res.status(exceptions.status).json({
			success: false,
			message: exceptions.message,
		});
	}
}
