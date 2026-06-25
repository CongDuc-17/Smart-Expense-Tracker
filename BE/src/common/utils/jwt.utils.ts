import { sign } from 'jsonwebtoken';

import type { SignOptions } from 'jsonwebtoken';

import { jwtConfig } from '@/configs';
import { LoginResponseDto } from '@/modules/auth/dtos';

type SignablePayload = Record<string, unknown>;

const createSignOptions = (expiresIn: SignOptions['expiresIn']): SignOptions => ({
	expiresIn,
});

export const signJWT = async (payload: SignablePayload): Promise<LoginResponseDto> => {
	const accessToken = sign(
		payload,
		jwtConfig.secretAccessToken,
		createSignOptions(jwtConfig.expiresInAccessToken),
	);
	const refreshToken = sign(
		payload,
		jwtConfig.secretRefreshToken,
		createSignOptions(jwtConfig.expiresInRefreshToken),
	);

	const tokens = new LoginResponseDto();
	tokens.accessToken = accessToken;
	tokens.refreshToken = refreshToken;
	return tokens;
};
