import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import { PrismaService } from '@/modules/database';
import { ImageProcessingStatusEnum } from '@prisma/client';
import { OptionalException } from '@/common';

interface ParsedOcrData {
	merchantName: string | null;
	suggestedCategoryName: string | null;
	totalAmount: number | null;
	transactionDate: string | null;
	extractedText: string;
	confidence: number;
}

export class OcrService {
	private prisma = new PrismaService();
	private genAI: GoogleGenerativeAI;
	private groq: Groq;

	private geminiModel: string = 'gemini-2.5-flash-lite';
	private groqVisionModel: string = 'qwen/qwen3.6-27b';

	constructor() {
		this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
		this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });
	}

	async scanReceipt(userId: string, imageBuffer: Buffer, mimeType: string, expenseId?: string): Promise<string> {
		// ... (Giữ nguyên code cũ của bạn)
		let ocrResultId: string;

		if (expenseId) {
			const expense = await this.prisma.expense.findFirst({
				where: { id: expenseId, userId },
			});
			if (!expense) throw new OptionalException(404, 'Expense không tồn tại');

			const ocrResult = await this.prisma.ocrResult.upsert({
				where: { expenseId },
				create: { expenseId, extractedText: '', status: ImageProcessingStatusEnum.PENDING },
				update: { status: ImageProcessingStatusEnum.PENDING, extractedText: '' },
			});
			ocrResultId = ocrResult.id;
		} else {
			const ocrResult = await this.prisma.ocrResult.create({
				data: { extractedText: '', status: ImageProcessingStatusEnum.PENDING } as any,
			});
			ocrResultId = ocrResult.id;
		}

		this.processOcrBackground(ocrResultId, imageBuffer, mimeType).catch((err) => {
			console.error('Background OCR processing failed:', err);
		});

		return ocrResultId;
	}

	private async processOcrBackground(ocrResultId: string, imageBuffer: Buffer, mimeType: string) {
		try {
			await this.prisma.ocrResult.update({
				where: { id: ocrResultId },
				data: { status: ImageProcessingStatusEnum.PROCESSING },
			});

			const rawResponse = await this.callAIOcr(imageBuffer, mimeType);
			const parsed = this.parseResponse(rawResponse);
			const categoryId = await this.mapCategoryFromAI(parsed.suggestedCategoryName || '');

			await this.prisma.ocrResult.update({
				where: { id: ocrResultId },
				data: {
					status: ImageProcessingStatusEnum.COMPLETED,
					merchantName: parsed.merchantName,
					categoryId: categoryId,
					totalAmount: parsed.totalAmount,
					transactionDate: parsed.transactionDate ? new Date(parsed.transactionDate) : null,
					extractedText: parsed.extractedText,
					confidenceScore: parsed.confidence,
					rawResponse: JSON.parse(rawResponse),
				},
			});
		} catch (error: any) {
			console.error('processOcrBackground error:', error);
			await this.prisma.ocrResult.update({
				where: { id: ocrResultId },
				data: {
					status: ImageProcessingStatusEnum.FAILED,
					errorMessage: error.message,
					retryCount: { increment: 1 },
				},
			});
		}
	}

	// HÀM CALL AI ĐÃ NÂNG CẤP FALLBACK
	private async callAIOcr(imageBuffer: Buffer, mimeType: string): Promise<string> {
		const prompt = `Analyze this receipt image and extract the following information in JSON format:
{
  "merchantName": "store name or null",
  "suggestedCategoryName": "suggested category name (e.g., Ăn uống, Di chuyển, Mua sắm, Hóa đơn) or null",
  "totalAmount": numeric_value_or_null,
  "transactionDate": "ISO 8601 date or null",
  "extractedText": "full raw text from image",
  "confidence": 0.0_to_1.0
}
Return ONLY valid JSON. If data cannot be extracted, set field to null.`;

		try {
			// LUỒNG 1: GEMINI
			const model = this.genAI.getGenerativeModel({
				model: this.geminiModel,
				generationConfig: { responseMimeType: 'application/json' },
			});
			const imageParts = [{ inlineData: { data: imageBuffer.toString('base64'), mimeType } }];
			const result = await model.generateContent([prompt, ...imageParts]);
			return (await result.response).text();

		} catch (geminiError: any) {
			console.warn('⚠️ [OCR Fallback] Gemini thất bại, chuyển sang Groq Vision...');

			// LUỒNG 2: GROQ VISION
			const base64Image = imageBuffer.toString('base64');
			const dataUrl = `data:${mimeType};base64,${base64Image}`;

			const response = await this.groq.chat.completions.create({
				model: this.groqVisionModel,
				response_format: { type: "json_object" },
				messages: [
					{
						role: 'user',
						content: [
							{ type: 'text', text: prompt },
							{ type: 'image_url', image_url: { url: dataUrl } }
						]
					}
				]
			});
			return response.choices[0]?.message?.content || '{}';
		}
	}

	private parseResponse(rawText: string): ParsedOcrData {
		try {
			// Trích xuất JSON từ chuỗi kết quả (bỏ qua các đoạn text đàm thoại thừa của AI)
			const jsonMatch = rawText.match(/\{[\s\S]*\}/);
			if (!jsonMatch) throw new Error('Không tìm thấy JSON block');

			const cleanText = jsonMatch[0];
			const json = JSON.parse(cleanText);

			let parsedAmount = null;
			if (typeof json.totalAmount === 'number') {
				parsedAmount = json.totalAmount;
			} else if (typeof json.totalAmount === 'string') {
				const num = parseFloat(json.totalAmount.replace(/[^\d.-]/g, ''));
				if (!isNaN(num)) parsedAmount = num;
			}

			return {
				merchantName: json.merchantName || null,
				suggestedCategoryName: json.suggestedCategoryName || null,
				totalAmount: parsedAmount,
				transactionDate: json.transactionDate || null,
				extractedText: json.extractedText || '',
				confidence: typeof json.confidence === 'number' ? json.confidence : 0,
			};
		} catch (error) {
			return {
				merchantName: null, suggestedCategoryName: null, totalAmount: null, transactionDate: null,
				extractedText: rawText, confidence: 0,
			};
		}
	}

	private async mapCategoryFromAI(suggestedName: string): Promise<string | null> {
		if (!suggestedName) return null;
		const categories = await this.prisma.category.findMany({
			where: { type: 'EXPENSE' },
		});
		const normalize = (str: string) => str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
		const suggested = normalize(suggestedName);

		for (const category of categories) {
			if (normalize(category.name).includes(suggested) || suggested.includes(normalize(category.name))) {
				return category.id;
			}
		}
		return null;
	}

	async getOcrResult(userId: string, ocrResultId: string) {
		const ocrResult = await this.prisma.ocrResult.findUnique({
			where: { id: ocrResultId },
			include: { expense: true },
		});
		if (!ocrResult) throw new OptionalException(404, 'OcrResult không tồn tại');

		// Kiểm tra quyền nếu OcrResult đã được gán cho một Expense
		if (ocrResult.expenseId && ocrResult.expense && ocrResult.expense.userId !== userId) {
			throw new OptionalException(403, 'Bạn không có quyền truy cập OcrResult này');
		}

		return ocrResult;
	}

	async verifyOcr(
		userId: string, ocrResultId: string,
		data: { merchantName?: string; totalAmount?: number; transactionDate?: string; applyToExpenseId?: string; }
	) {
		const ocrResult = await this.prisma.ocrResult.findUnique({
			where: { id: ocrResultId },
			include: { expense: true },
		});
		if (!ocrResult) throw new OptionalException(404, 'OcrResult không tồn tại');

		if (ocrResult.expense && ocrResult.expense.userId !== userId) {
			throw new OptionalException(403, 'Bạn không có quyền truy cập OcrResult này');
		}

		const expenseIdToUpdate = data.applyToExpenseId || ocrResult.expenseId;
		if (!expenseIdToUpdate) {
			throw new OptionalException(400, 'Thiếu expenseId để áp dụng kết quả OCR');
		}

		const updatedExpense = await this.prisma.expense.update({
			where: { id: expenseIdToUpdate },
			data: {
				...(data.merchantName !== undefined && { title: data.merchantName }),
				...(data.totalAmount !== undefined && { amount: data.totalAmount }),
				...(data.transactionDate !== undefined && { date: new Date(data.transactionDate) }),
			},
		});

		const updatedOcr = await this.prisma.ocrResult.update({
			where: { id: ocrResultId },
			data: {
				isVerified: true,
				...(data.merchantName !== undefined && { merchantName: data.merchantName }),
				...(data.totalAmount !== undefined && { totalAmount: data.totalAmount }),
				...(data.transactionDate !== undefined && { transactionDate: new Date(data.transactionDate) }),
			},
		});

		return { ocrResult: updatedOcr, expense: updatedExpense };
	}
}