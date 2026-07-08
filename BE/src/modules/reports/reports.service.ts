import path from 'path';

import ExcelJS from 'exceljs';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

import { OptionalException } from '@/common';
import { PrismaService } from '@/modules/database';

const pdfMake = require('pdfmake');

export class ReportService {
	private prisma = new PrismaService();

	public async exportMonthlyReport(
		userId: string,
		month: number,
		year: number,
		format: 'excel' | 'pdf',
	): Promise<Buffer> {
		const data = await this.gatherReportData(userId, month, year);

		if (format === 'excel') {
			return this.generateExcel(data);
		} else if (format === 'pdf') {
			return this.generatePDF(data);
		} else {
			throw new OptionalException(400, 'Format không hợp lệ');
		}
	}

	private async gatherReportData(userId: string, month: number, year: number) {
		const startOfMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
		const endOfMonth = new Date(Date.UTC(year, month, 1, 0, 0, 0));

		const [user, expenses, incomes, budgets] = await Promise.all([
			this.prisma.user.findUnique({
				where: { id: userId },
				select: { name: true, email: true },
			}),
			this.prisma.expense.findMany({
				where: {
					userId,
					deletedAt: null,
					date: { gte: startOfMonth, lt: endOfMonth },
				},
				include: { category: { select: { name: true } } },
				orderBy: { date: 'asc' },
				take: 1000,
			}),
			this.prisma.income.findMany({
				where: {
					userId,
					deletedAt: null,
					date: { gte: startOfMonth, lt: endOfMonth },
				},
				include: { category: { select: { name: true } } },
				orderBy: { date: 'asc' },
				take: 1000,
			}),
			this.prisma.budget.findMany({
				where: { userId, month, year },
				include: { category: { select: { name: true } } },
			}),
		]);

		if (!user) throw new OptionalException(404, 'User không tồn tại');

		const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
		const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount), 0);
		const netBalance = totalIncome - totalExpense;

		// Category Breakdown for expenses
		const categoryBreakdownMap = new Map<string, { count: number; total: number }>();
		expenses.forEach((e) => {
			const catName = e.category.name;
			const current = categoryBreakdownMap.get(catName) || { count: 0, total: 0 };
			categoryBreakdownMap.set(catName, {
				count: current.count + 1,
				total: current.total + Number(e.amount),
			});
		});

		const categoryBreakdown = Array.from(categoryBreakdownMap.entries()).map(
			([name, stats]) => ({
				name,
				count: stats.count,
				total: stats.total,
				percentage: totalExpense > 0 ? (stats.total / totalExpense) * 100 : 0,
			}),
		);
		// Sort by total descending
		categoryBreakdown.sort((a, b) => b.total - a.total);

		return {
			user,
			period: { month, year },
			summary: { totalIncome, totalExpense, netBalance },
			expenses,
			incomes,
			budgets,
			categoryBreakdown,
		};
	}

	private async generateExcel(data: any): Promise<Buffer> {
		const workbook = new ExcelJS.Workbook();
		workbook.creator = 'Smart Expense Tracker';

		// Sheet 1: Tổng quan
		const summarySheet = workbook.addWorksheet('Tổng quan');
		summarySheet.columns = [
			{ header: 'Mục', width: 25 },
			{ header: 'Giá trị', width: 25 },
		];
		summarySheet.addRow(['Người dùng', data.user.name]);
		summarySheet.addRow(['Email', data.user.email]);
		summarySheet.addRow([
			'Kỳ báo cáo',
			`Tháng ${data.period.month}/${data.period.year}`,
		]);
		summarySheet.addRow([]);
		summarySheet.addRow(['Tổng thu nhập', data.summary.totalIncome]);
		summarySheet.addRow(['Tổng chi tiêu', data.summary.totalExpense]);
		summarySheet.addRow(['Số dư', data.summary.netBalance]);

		// Sheet 2: Chi tiêu
		const expenseSheet = workbook.addWorksheet('Chi tiêu');
		expenseSheet.columns = [
			{ header: 'Ngày', key: 'date', width: 15 },
			{ header: 'Tiêu đề', key: 'title', width: 30 },
			{ header: 'Danh mục', key: 'category', width: 20 },
			{ header: 'Số tiền', key: 'amount', width: 15 },
			{ header: 'Ghi chú', key: 'note', width: 30 },
		];
		data.expenses.forEach((e: any) => {
			expenseSheet.addRow({
				date: e.date.toISOString().split('T')[0],
				title: e.title,
				category: e.category.name,
				amount: Number(e.amount),
				note: e.note || '',
			});
		});

		// Sheet 3: Thu nhập
		const incomeSheet = workbook.addWorksheet('Thu nhập');
		incomeSheet.columns = [
			{ header: 'Ngày', key: 'date', width: 15 },
			{ header: 'Tiêu đề', key: 'title', width: 30 },
			{ header: 'Danh mục', key: 'category', width: 20 },
			{ header: 'Số tiền', key: 'amount', width: 15 },
			{ header: 'Ghi chú', key: 'note', width: 30 },
		];
		data.incomes.forEach((i: any) => {
			incomeSheet.addRow({
				date: i.date.toISOString().split('T')[0],
				title: i.title,
				category: i.category.name,
				amount: Number(i.amount),
				note: i.note || '',
			});
		});

		// Sheet 4: Theo danh mục
		const categorySheet = workbook.addWorksheet('Theo danh mục');
		categorySheet.columns = [
			{ header: 'Danh mục', key: 'name', width: 25 },
			{ header: 'Số giao dịch', key: 'count', width: 15 },
			{ header: 'Tổng tiền', key: 'total', width: 20 },
			{ header: 'Tỷ trọng (%)', key: 'percentage', width: 15 },
		];
		data.categoryBreakdown.forEach((c: any) => {
			categorySheet.addRow({
				name: c.name,
				count: c.count,
				total: c.total,
				percentage: c.percentage.toFixed(2),
			});
		});

		const buffer = await workbook.xlsx.writeBuffer();
		return buffer as unknown as Buffer;
	}

	private async generatePDF(data: any): Promise<Buffer> {
		const fonts = {
			Roboto: {
				normal: path.join(
					__dirname,
					'../../../node_modules/pdfmake/fonts/Roboto/Roboto-Regular.ttf',
				),
				bold: path.join(
					__dirname,
					'../../../node_modules/pdfmake/fonts/Roboto/Roboto-Medium.ttf',
				),
				italics: path.join(
					__dirname,
					'../../../node_modules/pdfmake/fonts/Roboto/Roboto-Italic.ttf',
				),
				bolditalics: path.join(
					__dirname,
					'../../../node_modules/pdfmake/fonts/Roboto/Roboto-MediumItalic.ttf',
				),
			},
		};

		const content = [
			{ text: 'BÁO CÁO TÀI CHÍNH', style: 'header' },
			{
				text: `Người dùng: ${data.user.name} (${data.user.email})`,
				margin: [0, 5, 0, 5],
			},
			{
				text: `Kỳ báo cáo: Tháng ${data.period.month}/${data.period.year}`,
				margin: [0, 0, 0, 20],
			},

			{ text: 'TỔNG QUAN', style: 'subheader' },
			{
				table: {
					widths: ['*', '*'],
					body: [
						['Tổng thu nhập', data.summary.totalIncome.toLocaleString()],
						['Tổng chi tiêu', data.summary.totalExpense.toLocaleString()],
						['Số dư', data.summary.netBalance.toLocaleString()],
					],
				},
				margin: [0, 0, 0, 20],
			},

			{ text: 'CHI TIẾT CHI TIÊU', style: 'subheader' },
			data.expenses.length > 0
				? {
						table: {
							headerRows: 1,
							widths: ['auto', '*', 'auto', 'auto'],
							body: [
								['Ngày', 'Tiêu đề', 'Danh mục', 'Số tiền'],
								...data.expenses.map((e: any) => [
									e.date.toISOString().split('T')[0],
									e.title,
									e.category.name,
									Number(e.amount).toLocaleString(),
								]),
							],
						},
						margin: [0, 0, 0, 20],
					}
				: {
						text: 'Không có chi tiêu nào trong tháng.',
						margin: [0, 0, 0, 20],
						italics: true,
					},

			{ text: 'PHÂN TÍCH THEO DANH MỤC CHI TIÊU', style: 'subheader' },
			data.categoryBreakdown.length > 0
				? {
						table: {
							headerRows: 1,
							widths: ['*', 'auto', 'auto', 'auto'],
							body: [
								['Danh mục', 'Số GD', 'Tổng tiền', 'Tỷ trọng'],
								...data.categoryBreakdown.map((c: any) => [
									c.name,
									c.count.toString(),
									c.total.toLocaleString(),
									`${c.percentage.toFixed(2)}%`,
								]),
							],
						},
					}
				: { text: 'Không có dữ liệu.', italics: true },
		];

		// Đăng ký font
		pdfMake.setFonts(fonts);

		const docDefinition: TDocumentDefinitions = {
			defaultStyle: {
				font: 'Roboto',
				fontSize: 10,
				lineHeight: 1.2,
			},
			content: content as any,
			styles: {
				header: {
					fontSize: 18,
					bold: true,
					margin: [0, 0, 0, 10],
					alignment: 'center',
				},
				subheader: {
					fontSize: 14,
					bold: true,
					margin: [0, 15, 0, 5],
					color: '#333333',
				},
				tableHeader: {
					bold: true,
					fontSize: 11,
					color: 'white',
					fillColor: '#4CAF50',
					alignment: 'center',
				},
				tableTotal: {
					bold: true,
					fontSize: 11,
					fillColor: '#f2f2f2',
					alignment: 'right',
				},
			},
		};

		return new Promise(async (resolve, reject) => {
			try {
				const pdfDoc = pdfMake.createPdf(docDefinition);
				const buffer = await pdfDoc.getBuffer();
				resolve(buffer as Buffer);
			} catch (err) {
				reject(err);
			}
		});
	}
}
