import { OptionalException } from '@/common';
import { UserStatusEnum, RoleEnum } from '@prisma/client';
import { AdminRepository } from './admin.repository';

export class AdminService {
	private repository = new AdminRepository();

	async findAllUsers(query: {
		page?: any;
		limit?: any;
		search?: string;
		status?: UserStatusEnum | 'ALL' | string;
		role?: RoleEnum | 'ALL' | string;
	}) {
		const page = Number(query.page) || 1;
		const limit = Number(query.limit) || 10;
		const { search, status, role } = query;
		const skip = (page - 1) * limit;

		const where = {
			...(search
				? {
						OR: [
							{ email: { contains: search, mode: 'insensitive' as const } },
							{ name: { contains: search, mode: 'insensitive' as const } },
						],
				  }
				: {}),
			...(status && status !== 'ALL' ? { status: status as UserStatusEnum } : {}),
			...(role && role !== 'ALL' ? { role: role as RoleEnum } : {}),
		};

		const { total, users } = await this.repository.findAllUsers({ skip, take: limit, where });

		return {
			data: users,
			pagination: { page, limit, total },
		};
	}

	async findUserById(userId: string) {
		const user = await this.repository.findUserById(userId);

		if (!user) {
			throw new OptionalException(404, 'Người dùng không tồn tại');
		}

		return user;
	}

	async updateUserStatus(adminId: string, targetUserId: string, status: UserStatusEnum) {
		if (adminId === targetUserId) {
			throw new OptionalException(403, 'Bạn không thể khóa chính tài khoản của mình');
		}

		const user = await this.repository.findUserById(targetUserId);

		if (!user) {
			throw new OptionalException(404, 'Người dùng không tồn tại');
		}

		const updatedUser = await this.repository.updateUserStatus(targetUserId, status);

		if (status === UserStatusEnum.LOCKED) {
			// Force logout by deleting all refresh tokens
			await this.repository.deleteRefreshTokensByUserId(targetUserId);
		}

		return updatedUser;
	}

	async getSystemStats() {
		const startOfToday = new Date();
		startOfToday.setHours(0, 0, 0, 0);

		const stats = await this.repository.getSystemStats(startOfToday);

		return {
			totalUsers: stats.totalUsers,
			activeUsers: stats.activeUsers,
			lockedUsers: stats.lockedUsers,
			newUsersToday: stats.newUsersToday,
			totalExpenses: stats.totalExpenses,
			totalIncomes: stats.totalIncomes,
			totalTransactions: stats.totalExpenses + stats.totalIncomes,
			totalExpenseAmount: stats.expenseAgg._sum.amount ? stats.expenseAgg._sum.amount.toString() : '0',
		};
	}
}
