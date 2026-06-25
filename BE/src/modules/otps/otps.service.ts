import { otps } from '@prisma/client';
import { Exception } from '@tsed/exceptions';
import { StatusCodes } from 'http-status-codes';

import { UsersRepository } from '../users/users.repository';

import { OtpsRepository } from './otps.repository';

import { OptionalException } from '@/common';
import { otpsConfig } from '@/configs';

export class OtpsService {
	constructor(
		private readonly usersRepository = new UsersRepository(),
		private readonly otpsRepository = new OtpsRepository(),
	) {}

	async generateOtp({ userId }: { userId: string }): Promise<otps | Exception> {
		const otpExists = await this.otpsRepository.findOtp({ userId });
		if (otpExists && otpExists.expiresAt > new Date()) {
			throw new OptionalException(
				StatusCodes.CONFLICT,
				`OTP sẽ được cấp lại sau ${Math.ceil((otpExists.expiresAt.getTime() - new Date().getTime()) / 1000)} giây`,
			);
		}

		const otp = Math.floor(100000 + Math.random() * 999999).toString();
		const otpExpiresAt = new Date(Date.now() + otpsConfig.otpExpiresIn * 60 * 1000);

		if (otpExists) {
			const otpData = await this.otpsRepository.updateOtp({
				otpId: otpExists.id,
				otp: {
					otp: otp,
					expiresAt: otpExpiresAt,
				},
			});
			return otpData;
		}

		const otpData = await this.otpsRepository.createOtp({
			otp: {
				otp: otp,
				expiresAt: otpExpiresAt,
				user: {
					connect: { id: userId },
				},
			},
		});
		return otpData;
	}

	async verifyOtp({
		otp,
		userId,
	}: {
		otp: string;
		userId: string;
	}): Promise<boolean | Exception> {
		const otpRecord = await this.otpsRepository.findOtp({
			userId: userId,
			otp: otp,
		});
		if (!otpRecord) {
			return false;
		}

		if (otpRecord.expiresAt < new Date()) {
			await this.otpsRepository.deleteOtp({ otpId: otpRecord.id });
			throw new OptionalException(StatusCodes.UNAUTHORIZED, 'OTP expired');
		}

		await this.otpsRepository.deleteOtp({ otpId: otpRecord.id });

		return true;
	}
}
