import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { autoBindUtil, validateRequestMiddleware } from '@/common';
import authMiddleware from '@/common/middlewares/auth.middleware';
import { createApiResponse } from '@/swagger/openAPIResponseBuilders';

import { AnalyticsController } from './analytics.controller';
import { analyticsQueryObjectSchema, analyticsQueryValidationSchema } from './dtos';
import { analyticsSummaryResponseDtoSchema } from './dtos';

export const analyticsRegistry = new OpenAPIRegistry();

const analyticsController = new AnalyticsController();
const router = express.Router({ mergeParams: true });
autoBindUtil(analyticsController);

analyticsRegistry.registerPath({
	method: 'get',
	path: '/analytics/summary',
	tags: ['Analytics'],
	security: [{ BearerAuth: [] }],
	request: { query: analyticsQueryObjectSchema },
	responses: createApiResponse(analyticsSummaryResponseDtoSchema, 'Success'),
});
router.get(
	'/summary',
	authMiddleware.verifyAccessToken,
	validateRequestMiddleware(analyticsQueryValidationSchema),
	analyticsController.getSummary,
);
router.get('/monthly-comparison', analyticsController.getMonthlyComparison);
router.get('/heatmap', analyticsController.getHeatmap);
analyticsRegistry.registerPath({
	method: 'get',
	path: '/analytics/export',
	tags: ['Analytics'],
	security: [{ BearerAuth: [] }],
	request: { query: analyticsQueryObjectSchema },
	responses: {
		200: {
			description: 'CSV export file',
			content: {
				'text/csv': {
					schema: { type: 'string', format: 'binary' },
				},
			},
		},
	},
});
router.get(
	'/export',
	authMiddleware.verifyAccessToken,
	validateRequestMiddleware(analyticsQueryValidationSchema),
	analyticsController.exportReport,
);

export const analyticsRouter = router;
