import { Prisma, User } from '@prisma/client';
import { Exception } from '@tsed/exceptions';
import { genSalt, hash } from 'bcrypt';
import { StatusCodes } from 'http-status-codes';

import { AuthRepository } from '../auth/auth.repository';
import { UploadService } from '../upload/upload.service';

import {
	GetUserByUserIdRequestDto,
	GetUserResponseDto,
	GetUsersRequestDto,
	GetUsersResponseDto,
	UpdateMyInformationRequestDto,
	UpdateMyPasswordRequestDto,
	UserInformationDto,
} from './dtos';
import { UsersRepository } from './users.repository';

import {
	HttpResponseBodySuccessDto,
	NotFoundException,
	ObjectComparerDto,
	OptionalException,
	PaginationDto,
	PaginationUtils,
} from '@/common';

export class UsersService {
	constructor(
		private readonly authRepository: AuthRepository = new AuthRepository(),
		private readonly usersRepository: UsersRepository = new UsersRepository(),
		private readonly uploadService: UploadService = new UploadService(),
	) { }

	async getUsers(
		getUsersRequest: GetUsersRequestDto,
		pagination: PaginationDto,
	): Promise<HttpResponseBodySuccessDto<GetUsersResponseDto[]>> {
		const { name, status } = getUsersRequest;
		const paginationUtils = new PaginationUtils().extractSkipTakeFromPagination(
			pagination,
		);
		const [users, totalUsers] = await this.usersRepository.findUsers({
			name: name,
			status: status,
			skip: paginationUtils.skip,
			take: paginationUtils.take,
		});

		const userResponse = users.map((user) => new GetUsersResponseDto(user));
		return {
			success: true,
			data: userResponse,
			pagination:
				paginationUtils.convertPaginationResponseDtoFromTotalRecords(totalUsers),
		};
	}

	async getUserByUserId(
		getUserByUserIdRequestDto: GetUserByUserIdRequestDto,
	): Promise<HttpResponseBodySuccessDto<GetUserResponseDto>> {
		const { userId, status } = getUserByUserIdRequestDto;
		const user = await this.usersRepository.findUser({
			userId: userId,
			userStatus: status,
		});

		if (!user) {
			throw new NotFoundException('userId');
		}

		return {
			success: true,
			data: new GetUserResponseDto(user),
		};
	}

	async getMyInformation(
		myInformationDto: UserInformationDto,
	): Promise<HttpResponseBodySuccessDto<GetUserResponseDto>> {
		return {
			success: true,
			data: new GetUserResponseDto(myInformationDto),
		};
	}

	async updateMyInformation(
		updateMyInformationRequestDto: UpdateMyInformationRequestDto,
		myInformationDto: UserInformationDto,
		file?: Express.Multer.File,
	): Promise<HttpResponseBodySuccessDto<GetUserResponseDto> | Exception> {
		let uploadedImage: any = null;

		try {
			if (file) {
				uploadedImage = await this.uploadService.uploadImage(
					file.buffer,
					'avatar',
				);

				updateMyInformationRequestDto.avatar = uploadedImage.secure_url;
				updateMyInformationRequestDto.avatarPublicId = uploadedImage.public_id;
				console.log('Ảnh đã được upload lên Cloudinary:', uploadedImage);
			}

			const updateUserData = new ObjectComparerDto<UserInformationDto>(
				myInformationDto,
			).getUpdatedFields(
				updateMyInformationRequestDto,
			) as Prisma.UserUpdateManyMutationInput;
			if (Object.keys(updateUserData).length === 0) {
				if (uploadedImage && uploadedImage.public_id) {
					await this.uploadService.deleteImage(
						uploadedImage.public_id,
					);
					console.log('Đã xóa ảnh đã upload do không có trường nào được cập nhật');
				}
				console.log('Không có trường nào được cập nhật');
				return new OptionalException(
					StatusCodes.UNPROCESSABLE_ENTITY,
					'No fields to update',
				);
			}

			const updatedUser = await this.usersRepository.updateUser({
				userId: myInformationDto.id,
				user: updateUserData,
			});
			if (file && myInformationDto.avatarPublicId) {
				await this.uploadService.deleteImage(myInformationDto.avatarPublicId);
				console.log(`Đã xóa thành công ảnh cũ có public_id: ${myInformationDto.avatarPublicId}`);
			}
			return {
				success: true,
				data: new GetUserResponseDto(updatedUser),
			};
		} catch (error) {
			if (uploadedImage && uploadedImage.public_id) {
				await this.uploadService.deleteImage(uploadedImage.public_id);
			}
			throw new OptionalException(
				StatusCodes.INTERNAL_SERVER_ERROR,
				'Lỗi khi cập nhật thông tin người dùng',
			);
		}
	}

	async updateMyPassword(
		updateMyPasswordRequestDto: UpdateMyPasswordRequestDto,
		myInformationDto: UserInformationDto,
	): Promise<HttpResponseBodySuccessDto<GetUserResponseDto> | Exception> {
		const { newPassword } = updateMyPasswordRequestDto;
		const account = await this.authRepository.findAccount({
			userId: myInformationDto.id,
			email: myInformationDto.email,
		});

		const salt = await genSalt(10);
		const hashedPassword = await hash(newPassword, salt);

		if (!account) {
			const newAccountData: Prisma.AccountCreateInput = {
				salt: salt,
				password: hashedPassword,
				user: {
					connect: {
						id: myInformationDto.id,
					},
				},
			};

			await this.authRepository.createAccount({
				accounts: newAccountData,
			});
		}

		await this.authRepository.updatePassword({
			userId: myInformationDto.id,
			salt: salt,
			password: hashedPassword,
		});

		return {
			success: true,
			data: new GetUserResponseDto(myInformationDto),
		};
	}
}
