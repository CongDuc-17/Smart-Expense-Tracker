import { GetUsersRequestDto, GetUsersResponseDto } from './dtos';
import { UsersRepository } from './users.repository';

import { HttpResponseBodySuccessDto, PaginationDto, PaginationUtils } from '@/common';

export class UsersService {
	constructor(
		private readonly usersRepository: UsersRepository = new UsersRepository(),
	) {}

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
			skip: 1,
			take: 10,
		});

		const userResponse = users.map((user) => new GetUsersResponseDto(user));
		return {
			success: true,
			data: userResponse,
			pagination:
				paginationUtils.convertPaginationResponseDtoFromTotalRecords(totalUsers),
		};
	}
}
