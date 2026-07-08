import { RoleEnum } from '@prisma/client';
import { Router } from 'express';

import AdminController from './admin.controller';
import { adminGetUsersSchema, updateUserStatusSchema } from './admin.schema';

import { roleGuard } from '@/common/middlewares';
import { validateRequestMiddleware } from '@/common/middlewares';
import AuthMiddleware from '@/common/middlewares/auth.middleware';

export const adminRouter = Router();

adminRouter.use(AuthMiddleware.verifyAccessToken);
adminRouter.use(roleGuard(RoleEnum.ADMIN));

adminRouter.get(
	'/users',
	validateRequestMiddleware(adminGetUsersSchema),
	AdminController.getUsers,
);

adminRouter.get('/users/:id', AdminController.getUserById);

adminRouter.patch(
	'/users/:id/status',
	validateRequestMiddleware(updateUserStatusSchema),
	AdminController.updateUserStatus,
);

adminRouter.get('/stats', AdminController.getSystemStats);

adminRouter.post('/seed-categories', AdminController.seedCategories);

import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
export const adminRegistry = new OpenAPIRegistry();
