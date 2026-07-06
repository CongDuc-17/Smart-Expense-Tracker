import { Router } from 'express';
import AdminController from './admin.controller';
import { roleGuard } from '@/common/middlewares';
import { RoleEnum } from '@prisma/client';
import AuthMiddleware from '@/common/middlewares/auth.middleware';
import { validateRequestMiddleware } from '@/common/middlewares';
import { adminGetUsersSchema, updateUserStatusSchema, adminLoginSchema } from './admin.schema';
import { adminAuthMiddleware } from '@/common/middlewares';

export const adminRouter = Router();

adminRouter.post('/login', validateRequestMiddleware(adminLoginSchema), AdminController.login);

// Middleware 1: Kiểm tra xem request có dùng Fixed Admin JWT hay không
adminRouter.use(adminAuthMiddleware);

// Middleware 2: Nếu chưa có user (tức là không dùng Fixed Admin JWT), thì dùng verifyAccessToken bình thường
adminRouter.use((req, res, next) => {
	if ((req as any).isAdminAccessFixedToken) {
		return next();
	}
	return AuthMiddleware.verifyAccessToken(req, res, next);
});
adminRouter.use(roleGuard(RoleEnum.ADMIN));

adminRouter.get(
	'/users',
	validateRequestMiddleware(adminGetUsersSchema),
	AdminController.getUsers
);

adminRouter.get(
	'/users/:id',
	AdminController.getUserById
);

adminRouter.patch(
	'/users/:id/status',
	validateRequestMiddleware(updateUserStatusSchema),
	AdminController.updateUserStatus
);

adminRouter.get(
	'/stats',
	AdminController.getSystemStats
);

adminRouter.post(
	'/seed-categories',
	AdminController.seedCategories
);

import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
export const adminRegistry = new OpenAPIRegistry();
