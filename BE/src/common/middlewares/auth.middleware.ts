import { UserStatusEnum } from '@prisma/client';
import { ClientException, Exception } from '@tsed/exceptions';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { JsonWebTokenError, TokenExpiredError, verify } from 'jsonwebtoken';

import { UsersRepository } from '@/modules/users/users.repository';

import {
	InternalServerException,
	OptionalException,
	UnauthorizedException,
} from '../exceptions';
import { ITokenPayload } from '../interfaces';

import { BaseAutoBindMiddleware } from './baseAutoBindmiddleware';

import { jwtConfig } from '@/configs';
import { UserInformationDto } from '@/modules/users/dtos';

class AuthMiddleware extends BaseAutoBindMiddleware {
	constructor(private readonly userRepository = new UsersRepository()) {
		super();
	}

	async verifyAccessToken(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void | Exception> {
		const cookies = req.headers.cookie;
		const accessToken = cookies
			?.split('; ')
			.find((row) => row.startsWith('accessToken='))
			?.split('=')[1];
		let user: UserInformationDto;

		if (!accessToken) {
			throw new UnauthorizedException();
		}

		try {
			const payload: ITokenPayload = verify(
				accessToken,
				jwtConfig.secretAccessToken,
			) as ITokenPayload;
			const userData = await this.userRepository.findUser({
				userId: payload.userId,
				userStatus: UserStatusEnum.ACTIVE,
			});
			if (!userData) {
				throw new UnauthorizedException();
			}

			user = new UserInformationDto(userData);

			req.user = user;
		} catch (error) {
			if (error instanceof TokenExpiredError) {
				throw new OptionalException(StatusCodes.UNAUTHORIZED, error.message);
			}
			if (error instanceof JsonWebTokenError) {
				throw new UnauthorizedException(error.message);
			}
			throw new InternalServerException();
		}

		next();
	}

	async verifyRefreshToken(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void | Exception> {
		const cookies = req.headers.cookie;
		const accessToken = cookies
			?.split('; ')
			.find((row) => row.startsWith('accessToken='))
			?.split('=')[1];
		const refreshToken = cookies
			?.split('; ')
			.find((row) => row.startsWith('refreshToken='))
			?.split('=')[1];
		let user: UserInformationDto;

		if (!refreshToken || !accessToken) {
			throw new UnauthorizedException();
		}
		try {
			const payloadRefreshToken: ITokenPayload = verify(
				refreshToken,
				jwtConfig.secretRefreshToken,
			) as ITokenPayload;
			const payloadAccessToken: ITokenPayload = verify(
				accessToken,
				jwtConfig.secretAccessToken,
				{
					ignoreExpiration: true,
				},
			) as ITokenPayload;

			if (payloadAccessToken.exp > Date.now() / 1000) {
				throw new OptionalException(
					StatusCodes.CONFLICT,
					'Access token has not expired yet',
				);
			}

			const userData = await this.userRepository.findUser({
				userId: payloadRefreshToken.userId,
				userStatus: UserStatusEnum.ACTIVE,
			});
			if (!userData) {
				throw new UnauthorizedException();
			}

			user = new UserInformationDto(userData);

			req.user = user;
		} catch (error) {
			if (error instanceof TokenExpiredError) {
				throw new OptionalException(StatusCodes.UNAUTHORIZED, error.message);
			}
			if (error instanceof JsonWebTokenError) {
				throw new UnauthorizedException(error.message);
			}
			if (error instanceof ClientException) {
				throw error;
			}
		}

		next();
	}
}

export const roleGuard = (role: string) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const user = req.user as any;
		if (!user || user.role !== role) {
			return next(new OptionalException(StatusCodes.FORBIDDEN, 'Bạn không có quyền thực hiện chức năng này.'));
		}
		next();
	};
};

export default new AuthMiddleware();
