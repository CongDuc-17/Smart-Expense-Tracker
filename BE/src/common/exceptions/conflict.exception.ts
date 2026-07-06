import { ClientException } from '@tsed/exceptions';
import { StatusCodes } from 'http-status-codes';

export class ConflictException extends ClientException {
	constructor(public readonly resource?: string) {
		// If the resource string looks like a full sentence (contains spaces), use it verbatim.
		// Otherwise, keep the generic key-based message for backward compatibility.
		const message =
			resource && resource.includes(' ')
				? resource
				: `Resources already exist ${resource}`;
		super(StatusCodes.CONFLICT, message);
	}
}
