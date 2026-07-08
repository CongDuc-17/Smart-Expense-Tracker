import { TransactionTypeEnum } from '@prisma/client';
import { Exception } from '@tsed/exceptions';
import { StatusCodes } from 'http-status-codes';

import { CategoriesRepository } from '@/modules/categories/categories.repository';

import { CreateExpenseDto, ExpenseResponseDto, UpdateExpenseDto } from './dtos';
import { ExpensesRepository } from './expenses.repository';

import {
	HttpResponseBodySuccessDto,
	NotFoundException,
	OptionalException,
} from '@/common';
import { AppEvents, eventBus, ExpenseMutatedEventPayload } from '@/common/events';

export class ExpensesService {
	constructor(
		private readonly expensesRepository = new ExpensesRepository(),
		private readonly categoriesRepository = new CategoriesRepository(),
	) {}

	private async validateCategory(
		categoryId: string,
		userId: string,
		expectedType: TransactionTypeEnum,
	) {
		const category = await this.categoriesRepository.getCategoryById(categoryId);

		if (!category) {
			throw new NotFoundException('category');
		}

		if (!category.isDefault && category.userId !== userId) {
			throw new OptionalException(
				StatusCodes.BAD_REQUEST,
				'Category không hợp lệ hoặc không thuộc quyền sở hữu của bạn',
			);
		}

		if (category.type !== expectedType) {
			throw new OptionalException(
				StatusCodes.BAD_REQUEST,
				`Category này thuộc loại ${category.type}, không phù hợp với giao dịch loại ${expectedType}`,
			);
		}

		return category;
	}

	async findAll({
		userId,
		month,
		year,
		categoryId,
		page,
		limit,
	}: {
		userId: string;
		month?: number;
		year?: number;
		categoryId?: string;
		page: number;
		limit: number;
	}): Promise<{
		success: true;
		data: ExpenseResponseDto[];
		pagination: { page: number; limit: number; total: number; totalPages: number };
	}> {
		const { total, items } = await this.expensesRepository.findMany({
			userId,
			month,
			year,
			categoryId,
			page,
			limit,
		});

		return {
			success: true,
			data: items.map((item) => new ExpenseResponseDto(item)),
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		};
	}

	async findById({
		userId,
		id,
	}: {
		userId: string;
		id: string;
	}): Promise<HttpResponseBodySuccessDto<ExpenseResponseDto> | Exception> {
		const expense = await this.expensesRepository.findById(id);

		if (!expense || expense.deletedAt !== null || expense.userId !== userId) {
			throw new NotFoundException('expense');
		}

		return {
			success: true,
			data: new ExpenseResponseDto(expense),
		};
	}

	async create({
		userId,
		data,
	}: {
		userId: string;
		data: CreateExpenseDto;
	}): Promise<HttpResponseBodySuccessDto<ExpenseResponseDto> | Exception> {
		await this.validateCategory(data.categoryId, userId, TransactionTypeEnum.EXPENSE);

		const newExpense = await this.expensesRepository.create({
			data: {
				userId,
				categoryId: data.categoryId,
				amount: data.amount,
				title: data.title,
				note: data.note,
				date: new Date(data.date),
				imageUrl: data.imageUrl,
				imagePublicId: data.imagePublicId,
			},
		});

		const payload: ExpenseMutatedEventPayload = {
			userId,
			categoryId: data.categoryId,
			month: newExpense.date.getMonth() + 1,
			year: newExpense.date.getFullYear(),
		};
		eventBus.emit(AppEvents.EXPENSE_MUTATED, payload);

		if (newExpense.imageUrl) {
			eventBus.emit(AppEvents.EXPENSE_IMAGE_UPLOADED, {
				expenseId: newExpense.id,
				imageUrl: newExpense.imageUrl,
			});
		}

		return {
			success: true,
			data: new ExpenseResponseDto(newExpense),
		};
	}

	async update({
		userId,
		id,
		data,
	}: {
		userId: string;
		id: string;
		data: UpdateExpenseDto;
	}): Promise<HttpResponseBodySuccessDto<ExpenseResponseDto> | Exception> {
		const expense = await this.expensesRepository.findById(id);

		if (!expense || expense.deletedAt !== null || expense.userId !== userId) {
			throw new NotFoundException('expense');
		}

		if (data.categoryId) {
			await this.validateCategory(
				data.categoryId,
				userId,
				TransactionTypeEnum.EXPENSE,
			);
		}

		// Xóa ảnh cũ nếu có ảnh mới
		if (
			data.imagePublicId &&
			expense.imagePublicId &&
			data.imagePublicId !== expense.imagePublicId
		) {
			const { UploadService } = require('@/modules/upload/upload.service');
			const uploadService = new UploadService();
			uploadService.deleteImage(expense.imagePublicId);
		}

		const updatedExpense = await this.expensesRepository.update({
			id,
			data: {
				...(data.categoryId !== undefined && { categoryId: data.categoryId }),
				...(data.amount !== undefined && { amount: data.amount }),
				...(data.title !== undefined && { title: data.title }),
				...(data.note !== undefined && { note: data.note }),
				...(data.date !== undefined && { date: new Date(data.date) }),
				...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
				...(data.imagePublicId !== undefined && {
					imagePublicId: data.imagePublicId,
				}),
			},
		});

		const payload: ExpenseMutatedEventPayload = {
			userId,
			categoryId: updatedExpense.categoryId,
			month: updatedExpense.date.getMonth() + 1,
			year: updatedExpense.date.getFullYear(),
		};
		eventBus.emit(AppEvents.EXPENSE_MUTATED, payload);

		if (data.imageUrl && data.imageUrl !== expense.imageUrl) {
			eventBus.emit(AppEvents.EXPENSE_IMAGE_UPLOADED, {
				expenseId: updatedExpense.id,
				imageUrl: data.imageUrl,
			});
		}

		return {
			success: true,
			data: new ExpenseResponseDto(updatedExpense),
		};
	}

	async delete({
		userId,
		id,
	}: {
		userId: string;
		id: string;
	}): Promise<HttpResponseBodySuccessDto<null> | Exception> {
		const expense = await this.expensesRepository.findById(id);

		if (!expense || expense.deletedAt !== null || expense.userId !== userId) {
			throw new NotFoundException('expense');
		}

		await this.expensesRepository.softDelete({ id });

		const payload: ExpenseMutatedEventPayload = {
			userId,
			categoryId: expense.categoryId,
			month: expense.date.getMonth() + 1,
			year: expense.date.getFullYear(),
		};
		eventBus.emit(AppEvents.EXPENSE_MUTATED, payload);

		return {
			success: true,
			data: null,
		};
	}
}
