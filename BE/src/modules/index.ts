import { authRegistry, authRouter } from './auth/auth.router';
import { healthCheckRegistry, healthCheckRouter } from './healthCheck/healthCheck.router';
import { usersRegistry, usersRouter } from './users/users.router';

export const Registries = [healthCheckRegistry, authRegistry, usersRegistry];

export const Modules = {
	healthCheckRouter,
	authRouter,
	usersRouter,
};
