import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express from 'express';

import { autoBindUtil, validateRequestMiddleware } from '@/common';
import authMiddleware from '@/common/middlewares/auth.middleware';
import { createApiResponse } from '@/swagger/openAPIResponseBuilders';

import { NotificationsController } from './notifications.controller';
import {
	getNotificationsQueryObjectSchema,
	getNotificationsQueryValidationSchema,
	notificationIdParamObjectSchema,
	notificationIdParamValidationSchema,
	notificationResponseSchema,
} from './dtos';
import { z } from 'zod';

export const notificationsRegistry = new OpenAPIRegistry();

const notificationsController = new NotificationsController();
const router = express.Router({ mergeParams: true });
autoBindUtil(notificationsController);

// ─── GET /notifications ────────────────────────────────────────────────────────
notificationsRegistry.registerPath({
	method: 'get',
	path: '/notifications',
	tags: ['Notifications'],
	security: [{ BearerAuth: [] }],
	request: { query: getNotificationsQueryObjectSchema },
	responses: createApiResponse(z.array(notificationResponseSchema), 'Success'),
});
router.get(
	'/',
	authMiddleware.verifyAccessToken,
	validateRequestMiddleware(getNotificationsQueryValidationSchema),
	notificationsController.getNotifications,
);

// ─── GET /notifications/unread-count ───────────────────────────────────────────
notificationsRegistry.registerPath({
	method: 'get',
	path: '/notifications/unread-count',
	tags: ['Notifications'],
	security: [{ BearerAuth: [] }],
	responses: createApiResponse(z.object({ count: z.number() }), 'Success'),
});
router.get(
	'/unread-count',
	authMiddleware.verifyAccessToken,
	notificationsController.getUnreadCount,
);

// ─── PATCH /notifications/read-all ─────────────────────────────────────────────
notificationsRegistry.registerPath({
	method: 'patch',
	path: '/notifications/read-all',
	tags: ['Notifications'],
	security: [{ BearerAuth: [] }],
	responses: createApiResponse(z.object({ updatedCount: z.number() }), 'Success'),
});
router.patch(
	'/read-all',
	authMiddleware.verifyAccessToken,
	notificationsController.markAllAsRead,
);

// ─── PATCH /notifications/{id}/read ────────────────────────────────────────────
notificationsRegistry.registerPath({
	method: 'patch',
	path: '/notifications/{id}/read',
	tags: ['Notifications'],
	security: [{ BearerAuth: [] }],
	request: { params: notificationIdParamObjectSchema },
	responses: createApiResponse(notificationResponseSchema, 'Success'),
});
router.patch(
	'/:id/read',
	authMiddleware.verifyAccessToken,
	validateRequestMiddleware(notificationIdParamValidationSchema),
	notificationsController.markAsRead,
);

export const notificationsRouter = router;
