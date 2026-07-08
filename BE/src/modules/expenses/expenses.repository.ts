import { Prisma, PrismaService } from '../database';

export class ExpensesRepository {
	constructor(private readonly prismaService = new PrismaService()) {}

	async findMany({
		userId,
		month,
		year,
		categoryId,
		page,
		limit,
	}: {
		userId: string;
		month?: number;
		year?: number;
		categoryId?: string;
		page: number;
		limit: number;
	}) {
		const where: Prisma.ExpenseWhereInput = {
			userId,
			deletedAt: null,

			...(month && year
				? {
						date: {
							gte: new Date(year, month - 1, 1),
							lt: new Date(year, month, 1),
						},
					}
				: {}),
			...(categoryId ? { categoryId } : {}),
		};

		const [total, items] = await this.prismaService.$transaction([
			this.prismaService.expense.count({ where }),
			this.prismaService.expense.findMany({
				where,
				skip: (page - 1) * limit,
				take: limit,
				include: {
					category: {
						select: {
							id: true,
							name: true,
							icon: true,
							color: true,
							type: true,
						},
					},
				},
				orderBy: { date: 'desc' },
			}),
		]);

		return { total, items };
	}

	async findById(id: string) {
		return this.prismaService.expense.findUnique({
			where: { id },
			include: {
				category: {
					select: { id: true, name: true, icon: true, color: true, type: true },
				},
			},
		});
	}

	async create({ data }: { data: Prisma.ExpenseUncheckedCreateInput }) {
		return this.prismaService.expense.create({
			data,
			include: {
				category: {
					select: { id: true, name: true, icon: true, color: true, type: true },
				},
			},
		});
	}

	async update({ id, data }: { id: string; data: Prisma.ExpenseUncheckedUpdateInput }) {
		return this.prismaService.expense.update({
			where: { id },
			data,
			include: {
				category: {
					select: { id: true, name: true, icon: true, color: true, type: true },
				},
			},
		});
	}

	async softDelete({ id }: { id: string }) {
		return this.prismaService.expense.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	}
}
