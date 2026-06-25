import { ServerException } from '@tsed/exceptions';
import { StatusCodes } from 'http-status-codes';

export class InternalServerException extends ServerException {
	constructor() {
		super(StatusCodes.INTERNAL_SERVER_ERROR, 'Error from the server');
	}
}
