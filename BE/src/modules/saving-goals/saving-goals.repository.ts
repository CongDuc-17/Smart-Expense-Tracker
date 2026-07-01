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
		return this.prismaService.savingGoal.delete({
			where: { id },
		});
	}

	async deposit({
		id,
		amount,
		note,
	}: {
		id: string;
		amount: number;
		note?: string | null;
	}) {
		// Use transaction to ensure atomicity
		const result = await this.prismaService.$transaction(async (tx) => {
			const deposit = await tx.savingDeposit.create({
				data: {
					savingGoalId: id,
					amount,
					note,
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
