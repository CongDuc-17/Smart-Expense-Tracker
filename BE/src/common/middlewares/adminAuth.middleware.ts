import { NextFunction, Request, Response } from 'express';
import { PrismaClient, RoleEnum } from '@prisma/client';
import { UnauthorizedException } from '../exceptions';
import { StatusCodes } from 'http-status-codes';

const prisma = new PrismaClient();

/**
 * Middleware để xác thực các API admin.
 * Nó kiểm tra token truyền lên trong Header Authorization (Bearer <token>)
 * xem có khớp với jwtToken lưu trong bảng AdminAccess hay không.
 */
export const adminAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return next(); // Bỏ qua cho AuthMiddleware.verifyAccessToken xử lý
		}

		const token = authHeader.split(' ')[1];
		
		// Kiểm tra trong bảng AdminAccess (JWT tĩnh cố định)
		const adminRecord = await prisma.adminAccess.findFirst({
			where: { jwtToken: token }
		});

		if (adminRecord) {
			// Gắn user giả lập và đánh dấu để bỏ qua xác thực tiếp theo nếu cần
			(req as any).user = {
				id: adminRecord.id,
				email: adminRecord.email,
				role: adminRecord.role,
			};
			(req as any).isAdminAccessFixedToken = true;
			return next();
		}

		// Nếu không khớp token tĩnh, tiếp tục để JWT bình thường xác thực
		next();
	} catch (error) {
		next(error);
	}
};
