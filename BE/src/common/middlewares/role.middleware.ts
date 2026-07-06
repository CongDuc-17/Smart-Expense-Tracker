import { NextFunction, Request, Response } from 'express';
import { RoleEnum } from '@prisma/client';
import { UnauthorizedException, OptionalException } from '../exceptions';
import { StatusCodes } from 'http-status-codes';

export const roleGuard = (...roles: RoleEnum[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!req.user) {
			return next(new UnauthorizedException());
		}

		if (!(req.user as any).role || !roles.includes((req.user as any).role)) {
			return next(new OptionalException(StatusCodes.FORBIDDEN, 'Forbidden resource'));
		}

		next();
	};
};
