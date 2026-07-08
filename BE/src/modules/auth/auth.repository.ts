import { RefreshToken, UserStatusEnum } from '@prisma/client';

import { Prisma, PrismaService } from '../database';

import { AccountWithPartialRelations, SocialAccountWithPartialRelations } from '@/models';

export class AuthRepository {
	constructor(private readonly prismaService = new PrismaService()) {}

	async findAccount({
		userId,
		email,
		accountStatus,
	}: {
		userId?: string;
		email: string;
		accountStatus?: UserStatusEnum;
	}): Promise<AccountWithPartialRelations | null> {
		return this.prismaService.account.findFirst({
			include: {
				user: true,
			},
			where: {
				user: {
					id: userId,
					email: email,
					status: accountStatus,
				},
			},
		});
	}

	async findSocialAccount({
		userId,
		email,
		status,
	}: {
		email: string;
		userId?: string;
		status?: UserStatusEnum;
	}): Promise<SocialAccountWithPartialRelations | null> {
		return this.prismaService.socialAccount.findFirst({
			include: {
				user: true,
			},
			where: {
				user: {
					email: email,
					id: userId,
					status: status,
				},
			},
		});
	}

	async createAccount({
		accounts,
	}: {
		accounts: Prisma.AccountCreateInput;
	}): Promise<AccountWithPartialRelations> {
		return this.prismaService.account.create({
			include: {
				user: true,
			},
			data: accounts,
		});
	}

	async createSocialAccount({
		socialAccount,
	}: {
		socialAccount: Prisma.SocialAccountCreateInput;
	}): Promise<SocialAccountWithPartialRelations> {
		return this.prismaService.socialAccount.create({
			data: socialAccount,
		});
	}

	async createToken({
		token,
	}: {
		token: Prisma.RefreshTokenCreateInput;
	}): Promise<RefreshToken> {
		const { id, ...tokenData } = token;
		return this.prismaService.refreshToken.create({
			data: tokenData,
		});
	}

	async updatePassword({
		userId,
		password,
		salt,
	}: {
		userId: string;
		password: string;
		salt: string;
	}): Promise<AccountWithPartialRelations> {
		return this.prismaService.account.update({
			include: {
				user: true,
			},
			where: {
				userId: userId,
			},
			data: {
				password: password,
				salt: salt,
				user: {
					update: {
						verify: true,
					},
				},
			},
		});
	}
	async deleteToken(userId: string): Promise<Prisma.BatchPayload> {
		return this.prismaService.refreshToken.deleteMany({
			where: {
				userId: userId,
			},
		});
	}
}
