import { Otp, Prisma } from '@prisma/client';

import { PrismaService } from '../database';

export class OtpsRepository {
	constructor(private readonly prismaService = new PrismaService()) { }

	async findOtp({
		userId,
		email,
		otp,
	}: {
		userId: string;
		email?: string;
		otp?: string;
	}): Promise<Otp | null> {
		return this.prismaService.otp.findFirst({
			where: {
				user: {
					id: userId,
					email: email,
				},
				otp: otp,
			},
		});
	}

	async createOtp({ otp }: { otp: Prisma.OtpCreateInput }): Promise<Otp> {
		return this.prismaService.otp.create({
			data: otp,
		});
	}

	async updateOtp({
		otpId,
		otp,
	}: {
		otpId: string;
		otp: Prisma.OtpUpdateWithoutUserInput;
	}): Promise<Otp> {
		return this.prismaService.otp.update({
			where: { id: otpId },
			data: {
				otp: otp.otp,
				expiresAt: otp.expiresAt,
			},
		});
	}

	async deleteOtp({ otpId }: { otpId: string }): Promise<Otp> {
		return this.prismaService.otp.delete({
			where: { id: otpId },
		});
	}
}
