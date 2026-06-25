import { Exception } from '@tsed/exceptions';
import { Request, Response } from 'express';

import { GetUsersRequestDto, GetUsersResponseDto } from './dtos';
import { UsersService } from './users.service';

import { HttpResponseDto, PaginationDto } from '@/common';

export class UsersController {
	constructor(private readonly usersService: UsersService = new UsersService()) {}

	async getUsers(req: Request): Promise<Response> {
		const getUsersRequest: GetUsersRequestDto = new GetUsersRequestDto(req.query);
		const pagination: PaginationDto = new PaginationDto(req.query);

		const result = await this.usersService.getUsers(getUsersRequest, pagination);
		if (result instanceof Exception) {
			return new HttpResponseDto().exception(result);
		}
		return new HttpResponseDto().created<GetUsersResponseDto[]>(result);
	}
}
