import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express from 'express';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import { z } from 'zod';

import { AiController } from './ai.controller';
import {
	verifyOcrSchema,
	aiInsightsQuerySchema,
	previewClassificationSchema,
} from './dtos';

import { autoBindUtil, validateRequestMiddleware } from '@/common';
import authMiddleware from '@/common/middlewares/auth.middleware';

export const aiRegistry = new OpenAPIRegistry();

const aiController = new AiController();
const router = express.Router({ mergeParams: true });
autoBindUtil(aiController);

const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const aiRateLimiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 phút
	max: 5, // Tối đa 5 request vào endpoint AI mỗi phút
	message: 'Bạn đã đạt giới hạn sử dụng AI. Vui lòng thử lại sau 1 phút.',
	validate: { trustProxy: false },
});

// ─── POST /ai/scan-receipt ────────────────────────────────────────────────
aiRegistry.registerPath({
	method: 'post',
	path: '/ai/scan-receipt',
	tags: ['AI'],
	summary: 'Tải ảnh hóa đơn lên để AI nhận diện (OCR)',
	security: [{ BearerAuth: [] }],
	request: {
		body: {
			content: {
				'multipart/form-data': {
					schema: {
						type: 'object',
						properties: {
							file: {
								type: 'string',
								format: 'binary',
								description: 'Ảnh hóa đơn',
							},
							expenseId: {
								type: 'string',
								description:
									'ID của Giao dịch cần gắn hóa đơn (tùy chọn)',
							},
						},
						required: ['file'],
					},
				},
			},
		},
	},
	responses: {
		202: { description: 'Đang xử lý' },
	},
});

router.post(
	'/scan-receipt',
	authMiddleware.verifyAccessToken,
	aiRateLimiter,
	upload.single('file'),
	aiController.scanReceipt,
);

// ─── GET /ai/ocr-result/:ocrResultId ──────────────────────────────────────────
aiRegistry.registerPath({
	method: 'get',
	path: '/ai/ocr-result/{ocrResultId}',
	tags: ['AI'],
	summary: 'Lấy kết quả OCR (Polling)',
	security: [{ BearerAuth: [] }],
	request: {
		params: z.object({
			ocrResultId: z.string(),
		}),
	},
	responses: {
		200: { description: 'Kết quả OCR' },
	},
});

router.get(
	'/ocr-result/:ocrResultId',
	authMiddleware.verifyAccessToken,
	aiController.getOcrResult,
);

// ─── PATCH /ai/ocr-result/:id/verify ──────────────────────────────────────
aiRegistry.registerPath({
	method: 'patch',
	path: '/ai/ocr-result/{id}/verify',
	tags: ['AI'],
	summary: 'Xác nhận thông tin OCR và lưu vào Giao dịch',
	security: [{ BearerAuth: [] }],
	request: {
		params: z.object({
			id: z.string(),
		}),
		body: {
			content: {
				'application/json': {
					schema: verifyOcrSchema.body as any,
				},
			},
		},
	},
	responses: {
		200: { description: 'Xác nhận thành công' },
	},
});

router.patch(
	'/ocr-result/:id/verify',
	authMiddleware.verifyAccessToken,
	validateRequestMiddleware(verifyOcrSchema),
	aiController.verifyOcr,
);

// ─── GET /ai/image-analysis/:expenseId ──────────────────────────────────────
aiRegistry.registerPath({
	method: 'get',
	path: '/ai/image-analysis/{expenseId}',
	tags: ['AI'],
	summary: 'Lấy kết quả phân loại hình ảnh (Polling)',
	security: [{ BearerAuth: [] }],
	request: {
		params: z.object({
			expenseId: z.string(),
		}),
	},
	responses: {
		200: { description: 'Kết quả phân loại' },
	},
});

router.get(
	'/image-analysis/:expenseId',
	authMiddleware.verifyAccessToken,
	aiController.getImageAnalysis,
);

// ─── POST /ai/preview-classification ────────────────────────────────────────────
aiRegistry.registerPath({
	method: 'post',
	path: '/ai/preview-classification',
	tags: ['AI'],
	summary: 'Nhận diện danh mục từ ảnh (Không gắn vào Giao dịch)',
	security: [{ BearerAuth: [] }],
	request: {
		body: {
			content: {
				'application/json': {
					schema: previewClassificationSchema.body as any,
				},
			},
		},
	},
	responses: {
		200: { description: 'Kết quả phân loại' },
	},
});

router.post(
	'/preview-classification',
	authMiddleware.verifyAccessToken,
	aiRateLimiter,
	validateRequestMiddleware(previewClassificationSchema),
	aiController.previewClassification,
);

// ─── GET /ai/insights ──────────────────────────────────────────────────────
aiRegistry.registerPath({
	method: 'get',
	path: '/ai/insights',
	tags: ['AI'],
	summary: 'Lấy AI phân tích chi tiêu theo tháng (từ Cache)',
	security: [{ BearerAuth: [] }],
	request: {
		query: aiInsightsQuerySchema.query as any,
	},
	responses: {
		200: { description: 'AI Insights' },
	},
});

router.get(
	'/insights',
	authMiddleware.verifyAccessToken,
	validateRequestMiddleware(aiInsightsQuerySchema),
	aiController.getInsights,
);

// ─── POST /ai/insights/generate ────────────────────────────────────────────
aiRegistry.registerPath({
	method: 'post',
	path: '/ai/insights/generate',
	tags: ['AI'],
	summary: 'Yêu cầu AI sinh mới phân tích chi tiêu theo tháng',
	security: [{ BearerAuth: [] }],
	request: {
		query: aiInsightsQuerySchema.query as any,
	},
	responses: {
		200: { description: 'AI Insights đã được sinh' },
	},
});

router.post(
	'/insights/generate',
	authMiddleware.verifyAccessToken,
	aiRateLimiter,
	validateRequestMiddleware(aiInsightsQuerySchema),
	aiController.generateInsights,
);

export const aiRouter = router;
