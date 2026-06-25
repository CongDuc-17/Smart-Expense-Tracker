import { autoBindUtil } from '../utils';

export abstract class BaseAutoBindMiddleware {
	constructor() {
		autoBindUtil(this);
	}
}
