import type { SignOptions } from 'jsonwebtoken';

type JwtExpiresIn = Exclude<SignOptions['expiresIn'], undefined>;

const resolveRequiredString = (
	value: string | undefined,
	fallback: string,
	errorMessage: string,
): string => {
	if (typeof value === 'string' && value.trim().length > 0) {
		return value;
	}
	if (process.env.NODE_ENV === 'production') {
		throw new Error(errorMessage);
	}
	return fallback;
};

const resolveExpiresIn = (
	value: string | undefined,
	fallback: string,
	errorMessage: string,
): JwtExpiresIn => resolveRequiredString(value, fallback, errorMessage) as JwtExpiresIn;

export const jwtConfig = {
	expiresInAccessToken: resolveExpiresIn(
		process.env.EXPIRES_IN_ACCESS_TOKEN,
		'7d',
		'EXPIRES_IN_ACCESS_TOKEN must be set in production',
	),
	secretAccessToken: resolveRequiredString(
		process.env.JWT_SECRET_ACCESS_TOKEN,
		'dev-secret-access',
		'JWT_SECRET_ACCESS_TOKEN must be set in production',
	),
	expiresInRefreshToken: resolveExpiresIn(
		process.env.EXPIRES_IN_REFRESH_TOKEN,
		'365d',
		'EXPIRES_IN_REFRESH_TOKEN must be set in production',
	),
	secretRefreshToken: resolveRequiredString(
		process.env.JWT_SECRET_REFRESH_TOKEN,
		'dev-secret-refresh',
		'JWT_SECRET_REFRESH_TOKEN must be set in production',
	),
} satisfies {
	expiresInAccessToken: JwtExpiresIn;
	secretAccessToken: string;
	expiresInRefreshToken: JwtExpiresIn;
	secretRefreshToken: string;
};
