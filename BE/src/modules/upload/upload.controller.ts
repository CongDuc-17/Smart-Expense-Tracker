import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

import { UploadService, UploadContext } from './upload.service';

import { OptionalException } from '@/common';

export class UploadController {
	constructor(private readonly uploadService = new UploadService()) {}

	uploadImage = async (req: Request, res: Response, next: NextFunction) => {
		try {
			if (!req.file) {
				throw new OptionalException(
					StatusCodes.BAD_REQUEST,
					'Vui lòng cung cấp một file ảnh',
				);
			}

			// Lấy context từ query, ép kiểu an toàn
			const context = (req.query.context as UploadContext) || 'expense';

			const result = await this.uploadService.uploadImage(req.file.buffer, context);

			res.status(StatusCodes.OK).json({
				status: 'success',
				data: {
					url: result.secure_url,
					publicId: result.public_id,
					width: result.width,
					height: result.height,
					format: result.format,
					bytes: result.bytes,
				},
			});
		} catch (error) {
			next(error);
		}
	};
}
