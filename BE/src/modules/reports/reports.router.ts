import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express from 'express';
import rateLimit from 'express-rate-limit';

import { autoBindUtil, validateRequestMiddleware } from '@/common';
import authMiddleware from '@/common/middlewares/auth.middleware';
import { createApiResponse } from '@/swagger/openAPIResponseBuilders';

import { ReportController } from './reports.controller';
import { exportReportValidationSchema } from './dtos';

export const reportsRegistry = new OpenAPIRegistry();

const reportController = new ReportController();
const router = express.Router({ mergeParams: true });
autoBindUtil(reportController);

const exportRateLimiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 phút
	max: 2, // 2 request mỗi phút
	message: 'Bạn chỉ có thể xuất báo cáo 2 lần mỗi phút. Vui lòng thử lại sau.',
	validate: { trustProxy: false },
});

// ─── GET /reports/export ──────────────────────────────────────────────────
reportsRegistry.registerPath({
	method: 'get',
	path: '/reports/export',
	tags: ['Reports'],
	summary: 'Xuất báo cáo tài chính tháng (PDF / Excel)',
	security: [{ BearerAuth: [] }],
	request: {
		query: exportReportValidationSchema.query as any,
	},
	responses: {
		200: {
			description: 'File báo cáo',
			content: {
				'application/pdf': {
					schema: { type: 'string', format: 'binary' },
				},
				'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
					schema: { type: 'string', format: 'binary' },
				},
			},
		},
	},
});

router.get(
	'/export',
	authMiddleware.verifyAccessToken,
	exportRateLimiter,
	validateRequestMiddleware(exportReportValidationSchema),
	reportController.exportReport
);

export const reportsRouter = router;
