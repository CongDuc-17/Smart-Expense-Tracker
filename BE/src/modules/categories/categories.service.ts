import { TransactionTypeEnum } from '@prisma/client';
import { Exception } from '@tsed/exceptions';
import { StatusCodes } from 'http-status-codes';

import { CategoriesRepository } from './categories.repository';
import { CategoryResponseDto, CreateCategoryDto, UpdateCategoryDto } from './dtos';

import {
	ForbiddenException,
	HttpResponseBodySuccessDto,
	NotFoundException,
	OptionalException,
} from '@/common';

export class CategoriesService {
	constructor(private readonly categoriesRepository = new CategoriesRepository()) {}

	async findAll({
		userId,
		type,
	}: {
		userId: string;
		type?: TransactionTypeEnum;
	}): Promise<HttpResponseBodySuccessDto<CategoryResponseDto[]> | Exception> {
		const categories = await this.categoriesRepository.getCategories(userId, type);

		return {
			success: true,
			data: categories.map((category) => new CategoryResponseDto(category)),
		};
	}

	async findOne({
		userId,
		categoryId,
	}: {
		userId: string;
		categoryId: string;
	}): Promise<HttpResponseBodySuccessDto<CategoryResponseDto> | Exception> {
		const category = await this.categoriesRepository.getCategoryById(categoryId);

		if (!category) {
			throw new NotFoundException('category');
		}

		if (!category.isDefault && category.userId !== userId) {
			throw new ForbiddenException();
		}

		return {
			success: true,
			data: new CategoryResponseDto(category),
		};
	}

	async create({
		userId,
		data,
	}: {
		userId: string;
		data: CreateCategoryDto;
	}): Promise<HttpResponseBodySuccessDto<CategoryResponseDto> | Exception> {
		try {
			const newCategory = await this.categoriesRepository.createCategory({
				category: {
					name: data.name,
					type: data.type,
					icon: data.icon,
					color: data.color,
					isDefault: false,
					userId: userId,
				},
			});

			return {
				success: true,
				data: new CategoryResponseDto(newCategory),
			};
		} catch (error: unknown) {
			if (
				error &&
				typeof error === 'object' &&
				'code' in error &&
				(error as { code: string }).code === 'P2002'
			) {
				throw new OptionalException(
					StatusCodes.CONFLICT,
					'Tên danh mục đã tồn tại cho loại giao dịch này',
				);
			}
			throw error;
		}
	}

	async update({
		userId,
		categoryId,
		data,
	}: {
		userId: string;
		categoryId: string;
		data: UpdateCategoryDto;
	}): Promise<HttpResponseBodySuccessDto<CategoryResponseDto> | Exception> {
		const category = await this.categoriesRepository.getCategoryById(categoryId);

		if (!category) {
			throw new NotFoundException('category');
		}

		if (category.isDefault || category.userId !== userId) {
			throw new ForbiddenException();
		}

		try {
			const updatedCategory = await this.categoriesRepository.updateCategory({
				categoryId,
				data: {
					...(data.name !== undefined && { name: data.name }),
					...(data.icon !== undefined && { icon: data.icon }),
					...(data.color !== undefined && { color: data.color }),
				},
			});

			return {
				success: true,
				data: new CategoryResponseDto(updatedCategory),
			};
		} catch (error: unknown) {
			if (
				error &&
				typeof error === 'object' &&
				'code' in error &&
				(error as { code: string }).code === 'P2002'
			) {
				throw new OptionalException(
					StatusCodes.CONFLICT,
					'Tên danh mục đã tồn tại cho loại giao dịch này',
				);
			}
			throw error;
		}
	}

	async delete({
		userId,
		categoryId,
	}: {
		userId: string;
		categoryId: string;
	}): Promise<HttpResponseBodySuccessDto<null> | Exception> {
		const category = await this.categoriesRepository.getCategoryById(categoryId);

		if (!category) {
			throw new NotFoundException('category');
		}

		if (category.isDefault || category.userId !== userId) {
			throw new ForbiddenException();
		}

		const totalUsage =
			category._count.expenses + category._count.incomes + category._count.budgets;

		if (totalUsage > 0) {
			throw new OptionalException(
				StatusCodes.CONFLICT,
				`Không thể xóa danh mục đang được sử dụng. Vui lòng chuyển ${totalUsage} giao dịch sang danh mục khác trước.`,
			);
		}

		await this.categoriesRepository.deleteCategory({ categoryId });

		return {
			success: true,
			data: null,
		};
	}
}
