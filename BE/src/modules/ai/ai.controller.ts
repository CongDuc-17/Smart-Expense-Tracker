import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { OcrService } from './ocr.service';
import { ImageClassificationService } from './image-classification.service';
import { AiInsightService } from './ai-insight.service';
import { OptionalException } from '@/common';

export class AiController {
	constructor(
		private readonly ocrService = new OcrService(),
		private readonly imageClassificationService = new ImageClassificationService(),
		private readonly aiInsightService = new AiInsightService()
	) { }

	scanReceipt = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const file = req.file;
			if (!file) {
				throw new OptionalException(StatusCodes.BAD_REQUEST, 'Không tìm thấy file');
			}
			const expenseId = req.body.expenseId; // Có thể undefined

			// Lấy userId từ authMiddleware
			const userId = (req.user as any).id;

			const ocrResultId = await this.ocrService.scanReceipt(userId, file.buffer, file.mimetype, expenseId);

			res.status(StatusCodes.ACCEPTED).json({
				success: true,
				message: 'Đang xử lý ảnh hóa đơn',
				data: { ocrResultId, status: 'PROCESSING' },
			});
		} catch (error) {
			next(error);
		}
	};

	getOcrResult = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const ocrResultId = req.params.ocrResultId as string;
			const userId = (req.user as any).id;

			const result = await this.ocrService.getOcrResult(userId, ocrResultId);

			res.status(StatusCodes.OK).json({
				success: true,
				data: result,
			});
		} catch (error) {
			next(error);
		}
	};

	verifyOcr = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const ocrResultId = req.params.id as string;
			const userId = (req.user as any).id;

			const result = await this.ocrService.verifyOcr(userId, ocrResultId, req.body);

			res.status(StatusCodes.OK).json({
				success: true,
				message: 'Đã xác nhận OCR',
				data: result,
			});
		} catch (error) {
			next(error);
		}
	};

	getImageAnalysis = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const expenseId = req.params.expenseId as string;
			const userId = (req.user as any).id;

			const result = await this.imageClassificationService.getAnalysis(userId, expenseId);

			res.status(StatusCodes.OK).json({
				success: true,
				data: result,
			});
		} catch (error) {
			next(error);
		}
	};

	getInsights = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const month = Number(req.query.month);
			const year = Number(req.query.year);
			const userId = (req.user as any).id;

			const result = await this.aiInsightService.getInsights(userId, month, year);

			res.status(StatusCodes.OK).json({
				success: true,
				data: result,
			});
		} catch (error) {
			next(error);
		}
	};

	generateInsights = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const month = Number(req.query.month);
			const year = Number(req.query.year);
			const userId = (req.user as any).id;

			const result = await this.aiInsightService.generateInsights(userId, month, year);

			res.status(StatusCodes.OK).json({
				success: true,
				data: result,
			});
		} catch (error) {
			next(error);
		}
	};

	previewClassification = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { imageUrl } = req.body;
			const result = await this.imageClassificationService.previewClassification(imageUrl);

			res.status(StatusCodes.OK).json({
				success: true,
				data: result,
			});
		} catch (error) {
			next(error);
		}
	};
}
