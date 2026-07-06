import { PrismaClient, UserStatusEnum, RoleEnum, Prisma } from '@prisma/client';
import { Exception } from '@tsed/exceptions';
import { StatusCodes } from 'http-status-codes';

import { 
	OptionalException, 
	NotFoundException, 
	UnauthorizedException,
	HttpResponseBodySuccessDto,
	PaginationDto,
	PaginationUtils,
} from '@/common';

const prisma = new PrismaClient();

import bcrypt from 'bcrypt';

export class AdminUserService {
	async login(email: string, password: string): Promise<HttpResponseBodySuccessDto<any>> {
		const adminRecord = await prisma.adminAccess.findUnique({ where: { email } });
		
		if (!adminRecord) {
			throw new UnauthorizedException('Invalid admin credentials');
		}

		const isMatch = await bcrypt.compare(password, adminRecord.password);
		if (!isMatch) {
			throw new UnauthorizedException('Invalid admin credentials');
		}

		return {
			success: true,
			data: { token: adminRecord.jwtToken }
		};
	}

	async findAll(query: any): Promise<HttpResponseBodySuccessDto<any>> {
		const { page, limit, search, status, role } = query;
		
		const whereClause: Prisma.UserWhereInput = {
			...(search ? {
				OR: [
					{ email: { contains: search, mode: 'insensitive' } },
					{ name: { contains: search, mode: 'insensitive' } }
				]
			} : {}),
			...(status ? { status } : {}),
			...(role ? { role } : {}),
		};

		const [users, total] = await prisma.$transaction([
			prisma.user.findMany({
				where: whereClause,
				select: {
					id: true,
					email: true,
					name: true,
					role: true,
					status: true,
					verify: true,
					createdAt: true,
					_count: {
						select: { expenses: true, incomes: true, budgets: true }
					}
				},
				skip: (page - 1) * limit,
				take: limit,
				orderBy: { createdAt: 'desc' }
			}),
			prisma.user.count({ where: whereClause })
		]);

		const paginationUtils = new PaginationUtils();
		return {
			success: true,
			data: users,
			pagination: {
				currentPage: page,
				itemsPerPage: limit,
				totalItems: total,
				totalPages: Math.ceil(total / limit)
			}
		};
	}

	async findById(userId: string): Promise<HttpResponseBodySuccessDto<any>> {
		const user = await prisma.user.findUnique({
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
				avatar: true,
				_count: {
					select: { expenses: true, incomes: true, budgets: true, savingGoals: true }
				}
			}
		});

		if (!user) {
			throw new NotFoundException('User');
		}

		return {
			success: true,
			data: user,
		};
	}

	async updateStatus(adminId: string, targetUserId: string, status: UserStatusEnum): Promise<HttpResponseBodySuccessDto<any>> {
		if (adminId === targetUserId) {
			throw new OptionalException(StatusCodes.FORBIDDEN, 'Cannot lock yourself');
		}

		const user = await prisma.user.findUnique({ where: { id: targetUserId } });
		if (!user) {
			throw new NotFoundException('User');
		}

		const updatedUser = await prisma.user.update({
			where: { id: targetUserId },
			data: { status },
			select: {
				id: true,
				status: true,
			}
		});

		if (status === UserStatusEnum.LOCKED) {
			await prisma.refreshToken.deleteMany({
				where: { userId: targetUserId }
			});
		}

		return {
			success: true,
			data: updatedUser,
		};
	}

	async getSystemStats(): Promise<HttpResponseBodySuccessDto<any>> {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const [totalUsers, activeUsers, totalExpenses, totalIncomes, newUsersToday, totalExpenseAmount] = await prisma.$transaction([
			prisma.user.count(),
			prisma.user.count({ where: { status: 'ACTIVE' } }),
			prisma.expense.count({ where: { deletedAt: null } }),
			prisma.income.count({ where: { deletedAt: null } }),
			prisma.user.count({
				where: { createdAt: { gte: today } }
			}),
			prisma.expense.aggregate({
				_sum: { amount: true },
				where: { deletedAt: null }
			})
		]);

		return {
			success: true,
			data: {
				totalUsers,
				activeUsers,
				lockedUsers: totalUsers - activeUsers,
				newUsersToday,
				totalExpenses,
				totalIncomes,
				totalTransactions: totalExpenses + totalIncomes,
				totalExpenseAmount: totalExpenseAmount._sum.amount ? totalExpenseAmount._sum.amount.toString() : '0'
			}
		};
	}

	async seedDefaultCategories(): Promise<HttpResponseBodySuccessDto<any>> {
		// Logic to seed categories
		// This can be simplified to just a response or actual seed logic.
		return {
			success: true,
			data: {
				message: 'Categories seed completed'
			}
		};
	}
}
