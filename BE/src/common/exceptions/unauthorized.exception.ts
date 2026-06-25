import { ClientException } from '@tsed/exceptions';
import { StatusCodes } from 'http-status-codes';

export class UnauthorizedException extends ClientException {
	constructor(public readonly resource?: string) {
		super(
			StatusCodes.UNAUTHORIZED,
			`You are not authenticated because the token ${resource}`,
		);
	}
}
