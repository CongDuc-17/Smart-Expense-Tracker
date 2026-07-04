import { Prisma, PrismaService } from '../database';

export class SavingGoalsRepository {
	constructor(private readonly prismaService = new PrismaService()) {}

	async findMany({ userId, isCompleted }: { userId: string; isCompleted?: boolean }) {
		return this.prismaService.savingGoal.findMany({
			where: {
				userId,
				...(isCompleted !== undefined && { isCompleted }),
			},
			orderBy: { createdAt: 'desc' },
		});
	}

	async findById(id: string) {
		return this.prismaService.savingGoal.findUnique({
			where: { id },
			include: {
				deposits: {
					orderBy: { depositedAt: 'desc' },
				},
			},
		});
	}

	async create({ data }: { data: Prisma.SavingGoalUncheckedCreateInput }) {
		return this.prismaService.savingGoal.create({
			data,
		});
	}

	async update({ id, data }: { id: string; data: Prisma.SavingGoalUncheckedUpdateInput }) {
		return this.prismaService.savingGoal.update({
			where: { id },
			data,
		});
	}

	async delete({ id }: { id: string }) {
		return this.prismaService.$transaction(async (tx) => {
			const deposits = await tx.savingDeposit.findMany({
				where: { savingGoalId: id },
				select: { expenseId: true },
			});
			const expenseIds = deposits.map((d) => d.expenseId).filter(Boolean) as string[];

			const deletedGoal = await tx.savingGoal.delete({
				where: { id },
			});

			if (expenseIds.length > 0) {
				await tx.expense.updateMany({
					where: { id: { in: expenseIds } },
					data: { deletedAt: new Date() },
				});
			}

			return deletedGoal;
		});
	}

	async deposit({
		id,
		userId,
		goalTitle,
		amount,
		note,
	}: {
		id: string;
		userId: string;
		goalTitle: string;
		amount: number;
		note?: string | null;
	}) {
		// Use transaction to ensure atomicity
		const result = await this.prismaService.$transaction(async (tx) => {
			// 1. Find or create the hardcoded 'Mục tiêu tiết kiệm' category
			let savingCategory = await tx.category.findFirst({
				where: {
					userId,
					type: 'EXPENSE',
					isDefault: true,
					name: 'Mục tiêu tiết kiệm',
				},
			});

			if (!savingCategory) {
				savingCategory = await tx.category.create({
					data: {
						userId,
						name: 'Mục tiêu tiết kiệm',
						type: 'EXPENSE',
						icon: 'piggy-bank',
						color: '#10b981', // emerald-500
						isDefault: true,
					},
				});
			}

			// 2. Create the Expense record
			const expense = await tx.expense.create({
				data: {
					userId,
					categoryId: savingCategory.id,
					amount,
					title: `Nạp tiền: ${goalTitle}`,
					note: note || 'Chuyển tiền vào mục tiêu tiết kiệm',
					date: new Date(),
				},
			});

			const deposit = await tx.savingDeposit.create({
				data: {
					savingGoalId: id,
					amount,
					note,
					expenseId: expense.id,
				},
			});

			const updatedGoal = await tx.savingGoal.update({
				where: { id },
				data: {
					savedAmount: { increment: amount },
				},
			});

			return { deposit, updatedGoal };
		});

		return result;
	}
}
