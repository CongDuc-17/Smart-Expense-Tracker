import { Prisma, PrismaService } from '../database';

export class BudgetsRepository {
	constructor(private readonly prismaService = new PrismaService()) {}

	async findMany({
		userId,
		month,
		year,
	}: {
		userId: string;
		month: number;
		year: number;
	}) {
		return this.prismaService.budget.findMany({
			where: {
				userId,
				month,
				year,
			},
			include: {
				category: {
					select: { id: true, name: true, icon: true, color: true, type: true },
				},
			},
			orderBy: { category: { name: 'asc' } },
		});
	}

	async findById(id: string) {
		return this.prismaService.budget.findUnique({
			where: { id },
			include: {
				category: {
					select: { id: true, name: true, icon: true, color: true, type: true },
				},
			},
		});
	}

	async findByUniqueKey({
		userId,
		categoryId,
		month,
		year,
	}: {
		userId: string;
		categoryId: string;
		month: number;
		year: number;
	}) {
		return this.prismaService.budget.findUnique({
			where: {
				userId_categoryId_month_year: {
					userId,
					categoryId,
					month,
					year,
				},
			},
		});
	}

	async create({ data }: { data: Prisma.BudgetUncheckedCreateInput }) {
		return this.prismaService.budget.create({
			data,
			include: {
				category: {
					select: { id: true, name: true, icon: true, color: true, type: true },
				},
			},
		});
	}

	async update({ id, data }: { id: string; data: Prisma.BudgetUncheckedUpdateInput }) {
		return this.prismaService.budget.update({
			where: { id },
			data,
			include: {
				category: {
					select: { id: true, name: true, icon: true, color: true, type: true },
				},
			},
		});
	}

	async delete({ id }: { id: string }) {
		return this.prismaService.budget.delete({
			where: { id },
		});
	}

	/** Tính tổng số tiền chi tiêu của 1 category trong 1 tháng/năm */
	async aggregateExpenseSum({
		userId,
		categoryId,
		month,
		year,
	}: {
		userId: string;
		categoryId: string;
		month: number;
		year: number;
	}) {
		const result = await this.prismaService.expense.aggregate({
			where: {
				userId,
				categoryId,
				deletedAt: null,
				date: {
					gte: new Date(year, month - 1, 1),
					lt: new Date(year, month, 1),
				},
			},
			_sum: { amount: true },
		});

		return result._sum.amount ?? 0;
	}
}
