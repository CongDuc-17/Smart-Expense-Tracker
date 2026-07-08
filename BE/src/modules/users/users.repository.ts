import { Prisma, UserStatusEnum } from '@prisma/client';

import { PrismaService } from '../database';

import { User } from '@/models';

export class UsersRepository {
	constructor(private readonly prismaService = new PrismaService()) {}

	async findUsers({
		name,
		status,
		skip,
		take,
	}: {
		name?: string;
		status?: UserStatusEnum;
		skip: number;
		take: number;
	}): Promise<[User[], number]> {
		return Promise.all([
			this.prismaService.user.findMany({
				where: {
					name: name ? { contains: name, mode: 'insensitive' } : undefined,
					status: status,
				},
				skip: skip,
				take: take,
			}),
			this.prismaService.user.count({
				where: {
					name: name ? { contains: name, mode: 'insensitive' } : undefined,
					status: status,
				},
			}),
		]);
	}

	async findUser({
		userId,
		email,
		userStatus,
	}: {
		userId?: string;
		email?: string;
		userStatus?: UserStatusEnum;
	}): Promise<User | null> {
		return this.prismaService.user.findFirst({
			where: {
				id: userId,
				email: email,
				status: userStatus,
			},
		});
	}

	async updateUser({
		userId,
		user,
	}: {
		userId: string;
		user: Prisma.UserUpdateManyMutationInput;
	}): Promise<User> {
		const { id, ...userData } = user;
		return this.prismaService.user.update({
			where: { id: userId },
			data: userData,
		});
	}
}
