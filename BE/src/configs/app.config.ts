import dotenv from 'dotenv';
import { cleanEnv, host, port, str } from 'envalid';

dotenv.config();

export const appEnv = cleanEnv(process.env, {
	NODE_ENV: str({
		default: 'development',
		choices: ['development', 'production', 'test'],
	}),
	HOST: host({ default: 'localhost' }),
	PORT: port({ default: 3000 }),
	CORS_ORIGIN: str({ default: 'http://localhost:3000' }),
	CLOUDINARY_CLOUD_NAME: str({ default: '' }),
	CLOUDINARY_API_KEY: str({ default: '' }),
	CLOUDINARY_API_SECRET: str({ default: '' }),
});
