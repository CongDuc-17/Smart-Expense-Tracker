import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express from 'express';
import z from 'zod';

import { autoBindUtil, validateRequestMiddleware } from '@/common';
import authMiddleware from '@/common/middlewares/auth.middleware';
import { createApiResponse } from '@/swagger/openAPIResponseBuilders';

import { AnalyticsController } from './analytics.controller';
import {
	byCategoryQueryObjectSchema,
	byCategoryQueryValidationSchema,
	categoryBreakdownResponseSchema,
	dailyHeatmapResponseSchema,
	heatmapQueryObjectSchema,
	heatmapQueryValidationSchema,
	monthlySummaryResponseSchema,
	monthlyTrendResponseSchema,
	summaryQueryObjectSchema,
	summaryQueryValidationSchema,
	trendQueryObjectSchema,
	trendQueryValidationSchema,
	topExpenseResponseSchema,
	topExpensesQueryObjectSchema,
	topExpensesQueryValidationSchema,
} from './dtos';

export const analyticsRegistry = new OpenAPIRegistry();

const analyticsController = new AnalyticsController();
const router = express.Router({ mergeParams: true });
autoBindUtil(analyticsController);

// ─── GET /analytics/summary ───────────────────────────────────────────────────
analyticsRegistry.registerPath({
	method: 'get',
	path: '/analytics/summary',
	tags: ['Analytics'],
	security: [{ BearerAuth: [] }],
	request: { query: summaryQueryObjectSchema },
	responses: createApiResponse(monthlySummaryResponseSchema, 'Success'),
});
router.get(
	'/summary',
	authMiddleware.verifyAccessToken,
	validateRequestMiddleware(summaryQueryValidationSchema),
	analyticsController.getMonthlySummary,
);

// ─── GET /analytics/by-category ───────────────────────────────────────────────
analyticsRegistry.registerPath({
	method: 'get',
	path: '/analytics/by-category',
	tags: ['Analytics'],
	security: [{ BearerAuth: [] }],
	request: { query: byCategoryQueryObjectSchema },
	responses: createApiResponse(z.array(categoryBreakdownResponseSchema), 'Success'),
});
router.get(
	'/by-category',
	authMiddleware.verifyAccessToken,
	validateRequestMiddleware(byCategoryQueryValidationSchema),
	analyticsController.getCategoryBreakdown,
);

// ─── GET /analytics/monthly-trend ─────────────────────────────────────────────
analyticsRegistry.registerPath({
	method: 'get',
	path: '/analytics/monthly-trend',
	tags: ['Analytics'],
	security: [{ BearerAuth: [] }],
	request: { query: trendQueryObjectSchema },
	responses: createApiResponse(z.array(monthlyTrendResponseSchema), 'Success'),
});
router.get(
	'/monthly-trend',
	authMiddleware.verifyAccessToken,
	validateRequestMiddleware(trendQueryValidationSchema),
	analyticsController.getMonthlyTrend,
);

// ─── GET /analytics/heatmap ───────────────────────────────────────────────────
analyticsRegistry.registerPath({
	method: 'get',
	path: '/analytics/heatmap',
	tags: ['Analytics'],
	security: [{ BearerAuth: [] }],
	request: { query: heatmapQueryObjectSchema },
	responses: createApiResponse(z.array(dailyHeatmapResponseSchema), 'Success'),
});
router.get(
	'/heatmap',
	authMiddleware.verifyAccessToken,
	validateRequestMiddleware(heatmapQueryValidationSchema),
	analyticsController.getDailyHeatmap,
);

// ─── GET /analytics/top-expenses ──────────────────────────────────────────────
analyticsRegistry.registerPath({
	method: 'get',
	path: '/analytics/top-expenses',
	tags: ['Analytics'],
	security: [{ BearerAuth: [] }],
	request: { query: topExpensesQueryObjectSchema },
	responses: createApiResponse(z.array(topExpenseResponseSchema), 'Success'),
});
router.get(
	'/top-expenses',
	authMiddleware.verifyAccessToken,
	validateRequestMiddleware(topExpensesQueryValidationSchema),
	analyticsController.getTopExpenses,
);

export const analyticsRouter = router;
