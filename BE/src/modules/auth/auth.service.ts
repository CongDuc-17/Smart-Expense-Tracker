import { UserStatusEnum, RoleEnum } from '@prisma/client';
import { Exception } from '@tsed/exceptions';
import { genSalt, hash } from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { sign } from 'jsonwebtoken';

import { Prisma } from '../database';
import { MailsService } from '../mails/mail.service';
import { OtpsService } from '../otps/otps.service';
import { UserInformationDto } from '../users/dtos';
import { UsersRepository } from '../users/users.repository';

import { AuthRepository } from './auth.repository';
import {
	AccountResponseDto,
	CheckLoginWithGoogleOauthRequestDto,
	ForgotPasswordRequestDto,
	LoginRequestDto,
	LoginResponseDto,
	RegisterRequestDto,
	SendOtpRequestDto,
	VerifyRequestDto,
} from './dtos';

import {
	ConflictException,
	HttpResponseBodySuccessDto,
	NotFoundException,
	OptionalException,
	signJWT,
} from '@/common';
import { otpsConfig, usersConfig } from '@/configs';

export class AuthService {
	constructor(
		private readonly otpsService = new OtpsService(),
		private readonly mailsService = new MailsService(),
		private readonly authRepository = new AuthRepository(),
		private readonly usersRepository = new UsersRepository(),
	) {}

	async register(
		registerDto: RegisterRequestDto,
	): Promise<HttpResponseBodySuccessDto<AccountResponseDto> | Exception> {
		const user = await this.usersRepository.findUser({
			email: registerDto.email,
		});

		if (user) {
			throw new ConflictException('Email này đã được đăng ký.');
		}

		const salt = await genSalt(10);
		const hashedPassword = await hash(registerDto.password, salt);

		const account: Prisma.AccountCreateInput = {
			salt: salt,
			password: hashedPassword,
			user: {
				create: {
					email: registerDto.email,
					name: registerDto.name,
					avatar: usersConfig.defaultAvatarUrl,
				},
			},
		};

		const newAccount = await this.authRepository.createAccount({ accounts: account });

		try {
			await this.sendOtp({
				email: registerDto.email,
			});
		} catch (error) {
			console.log(error);
		}

		return {
			success: true,
			data: new AccountResponseDto(newAccount),
		};
	}

	async login(
		loginRequestDto: LoginRequestDto,
	): Promise<HttpResponseBodySuccessDto<LoginResponseDto> | Exception> {
		const account = await this.authRepository.findAccount({
			email: loginRequestDto.email,
		});

		if (!account) {
			throw new NotFoundException('email');
		}

		if (account.user?.status === UserStatusEnum.LOCKED) {
			throw new OptionalException(
				StatusCodes.FORBIDDEN,
				'Your account has been locked',
			);
		}

		if (account.user?.verify === false) {
			throw new OptionalException(
				StatusCodes.FORBIDDEN,
				'Your account has not been verified. Please verify your account before logging in.',
			);
		}

		const hashedPassword = await hash(loginRequestDto.password, account.salt);
		if (hashedPassword !== account.password) {
			throw new OptionalException(StatusCodes.UNAUTHORIZED, 'Invalid password');
		}

		const { accessToken, refreshToken } = await signJWT({
			userId: account.userId,
		});

		const cookies: any = {
			accessToken: accessToken,
			refreshToken: refreshToken,
		};

		if (account.user?.role === RoleEnum.ADMIN) {
			const adminToken = sign(
				{ role: RoleEnum.ADMIN },
				process.env.ACCESS_KEY_ADMIN || 'supersecretadmin',
				{ expiresIn: '6h' },
			);
			cookies.admin_access_token = adminToken;
		}

		await this.authRepository.createToken({
			token: {
				refreshToken: refreshToken,
				expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
				user: {
					connect: {
						id: account.userId,
					},
				},
			},
		});

		return {
			success: true,
			data: {
				accessToken: accessToken,
				refreshToken: refreshToken,
				role: account.user?.role,
			},
			cookies: cookies,
		};
	}

	async CheckLoginWithGoogleOauth(
		googleAuthData: CheckLoginWithGoogleOauthRequestDto,
	): Promise<HttpResponseBodySuccessDto<LoginResponseDto> | Exception> {
		const { socialAccountInformation } = googleAuthData;

		const { accessToken, refreshToken } = await signJWT({
			userId: socialAccountInformation.userId,
		});

		const user = await this.usersRepository.findUser({
			userId: socialAccountInformation.userId,
		});

		const cookies: any = {
			accessToken: accessToken,
			refreshToken: refreshToken,
		};

		if (user?.role === RoleEnum.ADMIN) {
			const adminToken = sign(
				{ role: RoleEnum.ADMIN },
				process.env.ACCESS_KEY_ADMIN || 'supersecretadmin',
				{ expiresIn: '6h' },
			);
			cookies.admin_access_token = adminToken;
		}

		await this.authRepository.createToken({
			token: {
				refreshToken: refreshToken,
				expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
				user: {
					connect: {
						id: socialAccountInformation.userId,
					},
				},
			},
		});

		return {
			success: true,
			data: {
				accessToken: accessToken,
				refreshToken: refreshToken,
				role: user?.role,
			},
			cookies: cookies,
		};
	}

	async refreshToken(
		userInformation: UserInformationDto,
	): Promise<HttpResponseBodySuccessDto<LoginResponseDto> | Exception> {
		const { accessToken, refreshToken } = await signJWT({
			userId: userInformation.id,
		});

		await this.authRepository.createToken({
			token: {
				refreshToken: refreshToken,
				expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
				user: {
					connect: {
						id: userInformation.id,
					},
				},
			},
		});

		return {
			success: true,
			data: {
				accessToken: accessToken,
				refreshToken: refreshToken,
			},
			cookies: {
				accessToken: accessToken,
				refreshToken: refreshToken,
			},
		};
	}

	async sendOtp(
		sendOtpRequestDto: SendOtpRequestDto,
	): Promise<HttpResponseBodySuccessDto<null> | Exception> {
		const { email } = sendOtpRequestDto;
		const user = await this.usersRepository.findUser({ email: email });
		if (!user) {
			throw new NotFoundException('email');
		}

		const otp = await this.otpsService.generateOtp({ userId: user.id });

		await this.mailsService.sendEmail({
			recipients: [
				{
					address: user.email,
					name: user.name,
				},
			],
			subject: 'Mã xác thực',
			html: `Mã xác thực của bạn là "${otp.otp}". Nó có hiệu lực trong ${otpsConfig.otpExpiresIn} phút. Vui lòng không chia sẻ mã này với bất kỳ ai.`,
		});

		return {
			success: true,
			data: null,
		};
	}

	async verify(
		verifyRequestDto: VerifyRequestDto,
	): Promise<HttpResponseBodySuccessDto<AccountResponseDto> | Exception> {
		const { email, otp } = verifyRequestDto;
		const account = await this.authRepository.findAccount({
			email: email,
			accountStatus: UserStatusEnum.ACTIVE,
		});
		if (!account || !account.user) {
			throw new NotFoundException('account');
		}

		if (account.user.verify === true) {
			throw new OptionalException(
				StatusCodes.CONFLICT,
				'Account is already verified',
			);
		}

		const isValidOtp = await this.otpsService.verifyOtp({
			userId: account.userId,
			otp: otp,
		});
		if (!isValidOtp) {
			throw new OptionalException(StatusCodes.BAD_REQUEST, 'Invalid OTP');
		}

		await this.usersRepository.updateUser({
			userId: account.userId,
			user: {
				verify: true,
			},
		});

		const accountResponse = new AccountResponseDto(account);
		accountResponse.verify = true;

		return {
			success: true,
			data: accountResponse,
		};
	}

	async forgotPassword(
		forgotPasswordRequestDto: ForgotPasswordRequestDto,
	): Promise<HttpResponseBodySuccessDto<AccountResponseDto> | Exception> {
		const { email, newPassword, otp } = forgotPasswordRequestDto;
		const user = await this.usersRepository.findUser({ email: email });
		if (!user) {
			throw new NotFoundException('email');
		}

		const isValidOtp = await this.otpsService.verifyOtp({
			userId: user.id,
			otp: otp,
		});

		if (!isValidOtp) {
			throw new OptionalException(StatusCodes.BAD_REQUEST, 'Invalid OTP');
		}

		const salt = await genSalt(10);
		const hashedPassword = await hash(newPassword, salt);

		const account: AccountResponseDto = new AccountResponseDto(
			await this.authRepository.updatePassword({
				userId: user.id,
				salt: salt,
				password: hashedPassword,
			}),
		);

		return {
			success: true,
			data: account,
		};
	}

	async logout(
		myInformation: UserInformationDto,
	): Promise<HttpResponseBodySuccessDto<null> | Exception> {
		await this.authRepository.deleteToken(myInformation.id);

		return {
			success: true,
			data: null,
			cookies: {
				accessToken: '',
				refreshToken: '',
			},
		};
	}
}
