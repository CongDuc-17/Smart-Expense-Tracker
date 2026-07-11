import dotenv from 'dotenv';
import { cleanEnv, host, port, str, testOnly } from 'envalid';

dotenv.config();

export const appEnv = cleanEnv(process.env, {
	NODE_ENV: str({
		devDefault: testOnly('test'),
		choices: ['development', 'production', 'test'],
	}),
	HOST: host({ devDefault: testOnly('127.0.0.1') }),
	PORT: port({ devDefault: testOnly(3000) }),
	CORS_ORIGIN: str({ devDefault: testOnly('http://127.0.0.1:3000') }),
	CLOUDINARY_CLOUD_NAME: str(),
	CLOUDINARY_API_KEY: str(),
	CLOUDINARY_API_SECRET: str(),
	ADMIN_ACCOUNTS: str({ devDefault: 'admin@gmail.com:ankara2214' }),
	ACCESS_KEY_ADMIN: str({ devDefault: 'supersecretadmin' }),
});
