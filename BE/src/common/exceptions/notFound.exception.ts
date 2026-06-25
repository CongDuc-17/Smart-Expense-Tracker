import { ClientException } from '@tsed/exceptions';
import { StatusCodes } from 'http-status-codes';

export class NotFoundException extends ClientException {
	constructor(public readonly resource?: string) {
		super(StatusCodes.NOT_FOUND, `Resource not found ${resource}`);
	}
}
