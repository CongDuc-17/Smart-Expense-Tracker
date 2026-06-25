import { ClientException } from '@tsed/exceptions';
import { StatusCodes } from 'http-status-codes';

import { InternalServerException } from './internalServer.exception';

export class OptionalException extends ClientException {
	constructor(
		public readonly httpStatusCode: StatusCodes,
		public readonly message: string,
	) {
		if (!httpStatusCode) {
			throw new InternalServerException();
		}
		super(httpStatusCode, message);
	}
}
