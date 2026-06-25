import dotenv from 'dotenv';
import { cleanEnv, host, port, str, testOnly } from 'envalid';

dotenv.config();

export const appEnv = cleanEnv(process.env, {
	NODE_ENV: str({
		devDefault: testOnly('test'),
		choices: ['development', 'production', 'test'],
	}),
	HOST: host({ devDefault: testOnly('localhost') }),
	PORT: port({ devDefault: testOnly(3000) }),
	CORS_ORIGIN: str({ devDefault: testOnly('http://localhost:3000') }),
});
