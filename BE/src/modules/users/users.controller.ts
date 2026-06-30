import { Exception } from '@tsed/exceptions';
import { Request, Response } from 'express';

import {
	GetUserByUserIdRequestDto,
	GetUserResponseDto,
	GetUsersRequestDto,
	GetUsersResponseDto,
	UpdateMyInformationRequestDto,
	UpdateMyPasswordRequestDto,
	UserInformationDto,
} from './dtos';
import { UsersService } from './users.service';

import { HttpResponseDto, PaginationDto } from '@/common';
import { StatusCodes } from 'http-status-codes';

export class UsersController {
	constructor(private readonly usersService: UsersService = new UsersService()) {}

	async getUsers(req: Request): Promise<Response> {
		const getUsersRequest: GetUsersRequestDto = new GetUsersRequestDto(req.query);
		const pagination: PaginationDto = new PaginationDto(req.query);

		const result = await this.usersService.getUsers(getUsersRequest, pagination);
		if (result instanceof Exception) {
			return new HttpResponseDto().exception(result);
		}
		return new HttpResponseDto().success<GetUsersResponseDto[]>(result);
	}

	async getUserByUserId(req: Request): Promise<Response> {
		const { userId } = req.params as { userId: string };

		const getUserByUserIdRequestDto = new GetUserByUserIdRequestDto(
			userId,
			req.query,
		);

		const result = await this.usersService.getUserByUserId(getUserByUserIdRequestDto);
		if (result instanceof Exception) {
			return new HttpResponseDto().exception(result);
		}
		return new HttpResponseDto().success<GetUserResponseDto>(result);
	}

	async getMyInformation(req: Request): Promise<Response> {
		console.log(req.user);
		const myInformationDto = req.user as UserInformationDto;

		const result = await this.usersService.getMyInformation(myInformationDto);
		if (result instanceof Exception) {
			return new HttpResponseDto().exception(result);
		}
		return new HttpResponseDto().success<GetUserResponseDto>(result);
	}

	async updateMyInformation(req: Request, res: Response): Promise<Response> {
		const updateMyInformationRequestDto = new UpdateMyInformationRequestDto(req.body);

		const myInformationDto = req.user as UserInformationDto;
		const file = req.file;
		try {
			const result = await this.usersService.updateMyInformation(
				updateMyInformationRequestDto,
				myInformationDto,
				file,
			);
			if (result instanceof Exception) {
				return res.status(result.status || 400).json({
					success: false,
					message: result.message,
				});
			}
			return res.status(StatusCodes.OK).json({
				success: true,
				data: result.data,
			});
		} catch (error) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				success: false,
				message: 'Lỗi server',
			});
		}
	}

	async updateMyPassword(req: Request): Promise<Response> {
		const updateMyPasswordRequestDto = new UpdateMyPasswordRequestDto(req.body);
		const myInformationDto = req.user as UserInformationDto;
		const result = await this.usersService.updateMyPassword(
			updateMyPasswordRequestDto,
			myInformationDto,
		);
		if (result instanceof Exception) {
			return new HttpResponseDto().exception(result);
		}
		return new HttpResponseDto().success<GetUserResponseDto>(result);
	}
}
