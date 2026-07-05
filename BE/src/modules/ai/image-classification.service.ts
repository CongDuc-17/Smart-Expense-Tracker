import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import { PrismaService } from '@/modules/database';
import { ImageProcessingStatusEnum } from '@prisma/client';
import { OptionalException } from '@/common';
import axios from 'axios';

interface GeminiClassifyResponse {
	suggestedTitle?: string;
	suggestedCategoryName: string;
	tags: string[];
	confidence: number;
}

export class ImageClassificationService {
	private prisma = new PrismaService();
	private genAI: GoogleGenerativeAI;
	private groq: Groq;

	private geminiModel: string = 'gemini-2.5-flash-lite';
	private groqVisionModel: string = 'qwen/qwen3.6-27b';

	constructor() {
		this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
		this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });
	}

	async classify(expenseId: string, imageUrl: string) {
		let imageAnalysisId: string;

		try {
			const analysis = await this.prisma.imageAnalysis.upsert({
				where: { expenseId },
				create: { expenseId, status: ImageProcessingStatusEnum.PROCESSING },
				update: { status: ImageProcessingStatusEnum.PROCESSING },
			});
			imageAnalysisId = analysis.id;

			const result = await this.analyzeImageBase(imageUrl);

			await this.prisma.imageAnalysis.update({
				where: { id: imageAnalysisId },
				data: {
					status: ImageProcessingStatusEnum.COMPLETED,
					suggestedCategoryId: result.suggestedCategoryId,
					tags: result.tags,
					confidenceScore: result.confidence,
					rawResponse: result.rawResponse,
				},
			});
		} catch (error: any) {
			console.error('ImageClassification error:', error);
			await this.prisma.imageAnalysis.updateMany({
				where: { expenseId },
				data: {
					status: ImageProcessingStatusEnum.FAILED,
					errorMessage: error.message,
					retryCount: { increment: 1 },
				},
			});
		}
	}

	async previewClassification(imageUrl: string) {
		return await this.analyzeImageBase(imageUrl);
	}

	private async analyzeImageBase(imageUrl: string) {
		const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
		const imageBuffer = Buffer.from(imageResponse.data, 'binary');
		const mimeType = (imageResponse.headers['content-type'] as string) || 'image/jpeg';

		const rawResponse = await this.callAIClassify(imageBuffer, mimeType);
		const parsed = this.parseResponse(rawResponse);
		const categoryId = await this.mapCategoryFromAI(parsed.suggestedCategoryName);

		return {
			suggestedTitle: parsed.suggestedTitle,
			suggestedCategoryId: categoryId,
			suggestedCategoryName: parsed.suggestedCategoryName,
			tags: parsed.tags,
			confidence: parsed.confidence,
			rawResponse: JSON.parse(rawResponse),
		};
	}

	// HÀM CALL AI
	private async callAIClassify(imageBuffer: Buffer, mimeType: string): Promise<string> {
		const prompt = `Analyze this expense image/receipt and suggest an appropriate spending category and a short title.
Return JSON format:
{
  "suggestedTitle": "Short title describing the expense (e.g., Ăn phở, Mua cà phê, Taxi Grab)",
  "suggestedCategoryName": "category name (e.g., Ăn uống, Di chuyển, Mua sắm, Giải trí, Hóa đơn)",
  "tags": ["tag1", "tag2"],
  "confidence": 0.0_to_1.0
}
Return ONLY valid JSON.`;

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
			console.warn('⚠️ [Vision Fallback] Gemini thất bại, chuyển sang Groq Vision...');

			// LUỒNG 2: GROQ VISION
			const base64Image = imageBuffer.toString('base64');
			const dataUrl = `data:${mimeType};base64,${base64Image}`;

			const response = await this.groq.chat.completions.create({
				model: this.groqVisionModel,
				response_format: { type: "json_object" }, // Ép trả về JSON
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

	private parseResponse(rawText: string): GeminiClassifyResponse {

		try {
			const json = JSON.parse(rawText);
			return {
				suggestedTitle: json.suggestedTitle,
				suggestedCategoryName: json.suggestedCategoryName || 'Khác',
				tags: Array.isArray(json.tags) ? json.tags : [],
				confidence: typeof json.confidence === 'number' ? json.confidence : 0,
			};
		} catch (error) {
			return { suggestedCategoryName: 'Khác', tags: [], confidence: 0 };
		}
	}

	private async mapCategoryFromAI(suggestedName: string): Promise<string | null> {
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

	async getAnalysis(userId: string, expenseId: string) {
		const expense = await this.prisma.expense.findFirst({
			where: { id: expenseId, userId },
			include: { imageAnalysis: { include: { suggestedCategory: true } } },
		});
		if (!expense) throw new OptionalException(404, 'Expense không tồn tại');
		return expense.imageAnalysis;
	}
}