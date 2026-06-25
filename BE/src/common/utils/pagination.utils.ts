import { PaginationDto } from '../dtos';

class PaginationDtoResponse {
	totalItems: number;
	itemsPerPage: number;
	currentPage: number;
	totalPages: number;
}

export class PaginationUtils {
	skip: number;
	take: number;

	extractSkipTakeFromPagination(pagination: PaginationDto): this {
		this.skip = (pagination.page - 1) * pagination.limit;
		this.take = pagination.limit;
		return this;
	}

	convertPaginationResponseDtoFromTotalRecords(
		totalRecords: number,
	): PaginationDtoResponse {
		const totalPage = Math.ceil(totalRecords / this.take);
		return {
			totalItems: totalRecords,
			itemsPerPage: this.take,
			currentPage: Math.floor(this.skip / this.take) + 1,
			totalPages: totalPage,
		};
	}
}
