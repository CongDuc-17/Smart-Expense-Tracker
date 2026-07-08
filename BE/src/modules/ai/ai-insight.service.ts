import { GoogleGenerativeAI } from '@google/generative-ai';
import { ServiceUnavailable } from '@tsed/exceptions';
import Groq from 'groq-sdk'; // Import thêm Groq

import { PrismaService } from '@/modules/database';
import { ReportService } from '@/modules/reports/reports.service';

export class AiInsightService {
	private prisma = new PrismaService();
	private reportService = new ReportService();

	// Khai báo 2 SDK
	private genAI: GoogleGenerativeAI;
	private groq: Groq;

	// Khai báo 2 Model
	private geminiModelName: string = 'gemini-2.5-flash-lite';
	private groqModelName: string = 'llama-3.3-70b-versatile'; // Model text của Groq

	constructor() {
		this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
		this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });
	}

	async getInsights(userId: string, month: number, year: number) {
		const cached = await this.prisma.aiInsight.findUnique({
			where: { userId_month_year: { userId, month, year } },
		});

		if (!cached) {
			return null;
		}

		return { ...cached, isCached: true };
	}

	async generateInsights(userId: string, month: number, year: number) {
		const reportData = await this.gatherDataForAI(userId, month, year);
		const rawContent = await this.generateInsight(reportData);

		// Attempt to extract JSON if wrapped in markdown
		let content = rawContent;
		try {
			const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
			if (jsonMatch) {
				content = jsonMatch[0];
			}
		} catch (e) {
			// ignore
		}

		const expiresAt = new Date();
		expiresAt.setHours(expiresAt.getHours() + 24);

		const insight = await this.prisma.aiInsight.upsert({
			where: { userId_month_year: { userId, month, year } },
			create: { userId, month, year, content, expiresAt },
			update: { content, expiresAt, generatedAt: new Date() },
		});

		return { ...insight, isCached: false };
	}

	private async gatherDataForAI(userId: string, month: number, year: number) {
		// Giữ nguyên logic cũ của bạn
		const startOfMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
		const endOfMonth = new Date(Date.UTC(year, month, 1, 0, 0, 0));

		const [expenses, incomes] = await Promise.all([
			this.prisma.expense.findMany({
				where: {
					userId,
					deletedAt: null,
					date: { gte: startOfMonth, lt: endOfMonth },
				},
				include: { category: { select: { name: true } } },
			}),
			this.prisma.income.findMany({
				where: {
					userId,
					deletedAt: null,
					date: { gte: startOfMonth, lt: endOfMonth },
				},
				include: { category: { select: { name: true } } },
			}),
		]);

		const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
		const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount), 0);

		const categoryBreakdownMap = new Map<string, number>();
		expenses.forEach((e) => {
			const catName = e.category.name;
			const current = categoryBreakdownMap.get(catName) || 0;
			categoryBreakdownMap.set(catName, current + Number(e.amount));
		});
		const categoryBreakdown = Array.from(categoryBreakdownMap.entries())
			.map(([name, total]) => ({ name, total }))
			.sort((a, b) => b.total - a.total);

		return { month, year, totalIncome, totalExpense, categoryBreakdown };
	}

	private async generateInsight(data: any): Promise<string> {
		const breakdownText = data.categoryBreakdown
			.map((c: any) => `- ${c.name}: ${c.total.toLocaleString()} VNĐ`)
			.join('\n');

		const prompt = `Bạn là chuyên gia tài chính cá nhân. Phân tích dữ liệu chi tiêu sau của tháng ${data.month}/${data.year}:
- Tổng thu: ${data.totalIncome.toLocaleString()} VNĐ
- Tổng chi: ${data.totalExpense.toLocaleString()} VNĐ  
- Chi tiêu theo danh mục:
${breakdownText}

Vui lòng trả về kết quả dưới dạng ĐÚNG MỘT OBJECT JSON duy nhất, có cấu trúc như sau (không dùng markdown code blocks, không nói lời chào):
{
  "overview": "Tổng quan tình hình tài chính tháng này",
  "risks": [
    "Rủi ro 1",
    "Rủi ro 2"
  ],
  "recommendations": [
    "Khuyến nghị 1",
    "Khuyến nghị 2"
  ],
  "actions": [
    "Hành động 1",
    "Hành động 2"
  ]
}`;

		try {
			// LUỒNG 1: THỬ GỌI GEMINI TRƯỚC
			const model = this.genAI.getGenerativeModel({ model: this.geminiModelName });
			const result = await model.generateContent(prompt);
			const response = await result.response;
			return response.text();
		} catch (geminiError: any) {
			console.warn('⚠️ [AI Fallback] Gemini thất bại, tự động chuyển sang Groq...');

			try {
				// LUỒNG 2: NẾU GEMINI LỖI (503, 429), CHUYỂN SANG GROQ
				const response = await this.groq.chat.completions.create({
					model: this.groqModelName,
					response_format: { type: 'json_object' },
					messages: [{ role: 'user', content: prompt }],
				});
				return response.choices[0]?.message?.content || '{}';
			} catch (groqError: any) {
				// CẢ 2 ĐỀU LỖI -> ĐẦU HÀNG, BÁO VỀ FRONTEND
				console.error('❌ [AI Error] Cả Gemini và Groq đều sập:', groqError);
				throw new ServiceUnavailable(
					'Hệ thống AI hiện đang quá tải. Vui lòng thử lại sau vài phút.',
				);
			}
		}
	}
}
