import { PrismaService } from '@/modules/database';
import { UserStatusEnum, RoleEnum, Prisma } from '@prisma/client';

export class AdminRepository {
	private prisma = new PrismaService();

	async findAllUsers(params: {
		skip: number;
		take: number;
		where: Prisma.UserWhereInput;
	}) {
		const { skip, take, where } = params;

		const [total, users] = await this.prisma.$transaction([
			this.prisma.user.count({ where }),
			this.prisma.user.findMany({
				where,
				select: {
					id: true,
					email: true,
					name: true,
					role: true,
					status: true,
					verify: true,
					createdAt: true,
					_count: {
						select: { expenses: true, incomes: true, budgets: true },
					},
				},
				skip,
				take,
				orderBy: { createdAt: 'desc' },
			}),
		]);

		return { total, users };
	}

	async findUserById(userId: string) {
		return await this.prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				email: true,
				name: true,
				role: true,
				status: true,
				verify: true,
				createdAt: true,
				updatedAt: true,
				_count: {
					select: { expenses: true, incomes: true, budgets: true, savingGoals: true },
				},
			},
		});
	}

	async updateUserStatus(targetUserId: string, status: UserStatusEnum) {
		return await this.prisma.user.update({
			where: { id: targetUserId },
			data: { status },
			select: { id: true, status: true },
		});
	}

	async deleteRefreshTokensByUserId(userId: string) {
		return await this.prisma.refreshToken.deleteMany({
			where: { userId },
		});
	}

	async getSystemStats(startOfToday: Date) {
		const [
			totalUsers,
			activeUsers,
			lockedUsers,
			newUsersToday,
			totalExpenses,
			totalIncomes,
			expenseAgg,
		] = await this.prisma.$transaction([
			this.prisma.user.count(),
			this.prisma.user.count({ where: { status: 'ACTIVE' } }),
			this.prisma.user.count({ where: { status: 'LOCKED' } }),
			this.prisma.user.count({ where: { createdAt: { gte: startOfToday } } }),
			this.prisma.expense.count({ where: { deletedAt: null } }),
			this.prisma.income.count({ where: { deletedAt: null } }),
			this.prisma.expense.aggregate({
				where: { deletedAt: null },
				_sum: { amount: true },
			}),
		]);

		return {
			totalUsers,
			activeUsers,
			lockedUsers,
			newUsersToday,
			totalExpenses,
			totalIncomes,
			expenseAgg,
		};
	}
}
