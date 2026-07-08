import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express from 'express';
import rateLimit from 'express-rate-limit';
import multer from 'multer';

import {
	uploadImageQueryObjectSchema,
	uploadImageValidationSchema,
	uploadResponseSchema,
} from './dtos';
import { UploadController } from './upload.controller';

import { autoBindUtil, validateRequestMiddleware, OptionalException } from '@/common';
import authMiddleware from '@/common/middlewares/auth.middleware';
import { createApiResponse } from '@/swagger/openAPIResponseBuilders';

export const uploadRegistry = new OpenAPIRegistry();

const uploadController = new UploadController();
const router = express.Router({ mergeParams: true });
autoBindUtil(uploadController);

// Cấu hình Multer
const fileFilter = (
	req: express.Request,
	file: Express.Multer.File,
	cb: multer.FileFilterCallback,
) => {
	const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
	if (allowedMimes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new OptionalException(400, 'Chỉ chấp nhận file ảnh JPG, PNG, WebP'));
	}
};

const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
	fileFilter,
});

// ─── POST /upload/image ────────────────────────────────────────────────────────
uploadRegistry.registerPath({
	method: 'post',
	path: '/upload/image',
	tags: ['Upload'],
	summary: 'Upload ảnh lên Cloudinary',
	security: [{ BearerAuth: [] }],
	request: {
		query: uploadImageQueryObjectSchema,
		body: {
			content: {
				'multipart/form-data': {
					schema: {
						type: 'object',
						properties: {
							file: {
								type: 'string',
								format: 'binary',
							},
						},
					},
				},
			},
		},
	},
	responses: createApiResponse(uploadResponseSchema, 'Upload thành công'),
});

const uploadRateLimiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 10, // Limit each user to 10 upload requests per windowMs
	message: 'Quá nhiều yêu cầu tải lên, vui lòng thử lại sau 1 phút',
	standardHeaders: true,
	legacyHeaders: false,
});

router.post(
	'/image',
	authMiddleware.verifyAccessToken,
	uploadRateLimiter,
	validateRequestMiddleware(uploadImageValidationSchema),
	upload.single('file'),
	uploadController.uploadImage,
);

export const uploadRouter = router;
