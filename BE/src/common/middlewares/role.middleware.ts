import { RoleEnum } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { verify } from 'jsonwebtoken';

import { UnauthorizedException, OptionalException } from '../exceptions';

export const roleGuard = (...roles: RoleEnum[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		if (roles.includes(RoleEnum.ADMIN)) {
			const cookies = req.headers.cookie;
			const adminToken = cookies
				?.split('; ')
				.find((row) => row.startsWith('admin_access_token='))
				?.split('=')[1];

			if (adminToken && process.env.ACCESS_KEY_ADMIN) {
				try {
					const decoded = verify(
						adminToken,
						process.env.ACCESS_KEY_ADMIN,
					) as any;
					if (decoded.role === RoleEnum.ADMIN) {
						if (!req.user) {
							(req as any).user = {};
						}
						(req as any).user.role = RoleEnum.ADMIN;
					}
				} catch (err) {
					// fallback to default check
				}
			}
		}

		if (!req.user) {
			return next(new UnauthorizedException());
		}

		if (!(req.user as any).role || !roles.includes((req.user as any).role)) {
			return next(
				new OptionalException(StatusCodes.FORBIDDEN, 'Forbidden resource'),
			);
		}

		next();
	};
};
