import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express from 'express';
import { autoBindUtil, validateRequestMiddleware } from '@/common';
import authMiddleware, { roleGuard } from '@/common/middlewares/auth.middleware';

import { AdminController } from './admin.controller';
import { adminGetUsersQuerySchema, updateUserStatusSchema } from './dtos';

export const adminRegistry = new OpenAPIRegistry();

const adminController = new AdminController();
const router = express.Router({ mergeParams: true });
autoBindUtil(adminController);

// Apply auth & role guard for all admin routes
router.use(authMiddleware.verifyAccessToken, roleGuard('ADMIN'));

// ─── GET /admin/stats ──────────────────────────────────────────────────────
adminRegistry.registerPath({
	method: 'get',
	path: '/admin/stats',
	tags: ['Admin'],
	summary: 'Lấy thống kê hệ thống',
	security: [{ BearerAuth: [] }],
	responses: {
		200: { description: 'Thống kê thành công' },
	},
});
router.get('/stats', adminController.getSystemStats);

// ─── GET /admin/users ──────────────────────────────────────────────────────
adminRegistry.registerPath({
	method: 'get',
	path: '/admin/users',
	tags: ['Admin'],
	summary: 'Lấy danh sách người dùng (có phân trang & filter)',
	security: [{ BearerAuth: [] }],
	request: {
		query: adminGetUsersQuerySchema.query as any,
	},
	responses: {
		200: { description: 'Thành công' },
	},
});
router.get('/users', validateRequestMiddleware(adminGetUsersQuerySchema), adminController.getUsers);

// ─── GET /admin/users/:id ──────────────────────────────────────────────────
adminRegistry.registerPath({
	method: 'get',
	path: '/admin/users/{id}',
	tags: ['Admin'],
	summary: 'Lấy chi tiết 1 người dùng',
	security: [{ BearerAuth: [] }],
	request: {
		params: updateUserStatusSchema.params as any, // reuse params schema which has `id`
	},
	responses: {
		200: { description: 'Thành công' },
	},
});
router.get('/users/:id', adminController.getUserById);

// ─── PATCH /admin/users/:id/status ─────────────────────────────────────────
adminRegistry.registerPath({
	method: 'patch',
	path: '/admin/users/{id}/status',
	tags: ['Admin'],
	summary: 'Khóa / Mở khóa người dùng',
	security: [{ BearerAuth: [] }],
	request: {
		params: updateUserStatusSchema.params as any,
		body: {
			content: {
				'application/json': {
					schema: updateUserStatusSchema.body as any,
				},
			},
		},
	},
	responses: {
		200: { description: 'Thành công' },
	},
});
router.patch(
	'/users/:id/status',
	validateRequestMiddleware(updateUserStatusSchema),
	adminController.updateUserStatus
);

export const adminRouter = router;
