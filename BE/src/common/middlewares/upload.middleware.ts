import express from 'express';
import multer from 'multer';

import { OptionalException } from '../exceptions';

const fileFilter = (req: express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
	const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
	if (allowedMimes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new OptionalException(400, 'Chỉ chấp nhận file ảnh JPG, PNG, WebP'));
	}
};

export const uploadAvatarMiddleware = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
	fileFilter,
});
