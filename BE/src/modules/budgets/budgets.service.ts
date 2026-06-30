import { BudgetAlertStatusEnum, TransactionTypeEnum } from '@prisma/client';
import { Exception } from '@tsed/exceptions';
import { StatusCodes } from 'http-status-codes';

import {
	ForbiddenException,
	HttpResponseBodySuccessDto,
	NotFoundException,
	OptionalException,
} from '@/common';
import { AppEvents, eventBus, ExpenseMutatedEventPayload } from '@/common/events';
import { CategoriesRepository } from '@/modules/categories/categories.repository';

import { BudgetsRepository } from './budgets.repository';
import { BudgetResponseDto, CreateBudgetDto, UpdateBudgetDto } from './dtos';

export class BudgetsService {
	constructor(
		private readonly budgetsRepository = new BudgetsRepository(),
		private readonly categoriesRepository = new CategoriesRepository(),
	) {
		// Listen to expense changes to trigger internal budget recalculation
		eventBus.on(AppEvents.EXPENSE_MUTATED, this.handleExpenseMutated.bind(this));
	}

	private async validateCategory(categoryId: string, userId: string) {
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

		// Budget chỉ có ý nghĩa với các khoản chi (EXPENSE)
		if (category.type !== TransactionTypeEnum.EXPENSE) {
			throw new OptionalException(
				StatusCodes.BAD_REQUEST,
				`Không thể đặt hạn mức cho danh mục loại ${category.type}. Chỉ hỗ trợ loại EXPENSE.`,
			);
		}

		return category;
	}

	async findAll({
		userId,
		month,
		year,
	}: {
		userId: string;
		month: number;
		year: number;
	}): Promise<HttpResponseBodySuccessDto<BudgetResponseDto[]>> {
		const budgets = await this.budgetsRepository.findMany({ userId, month, year });

		return {
			success: true,
			data: budgets.map((b) => new BudgetResponseDto(b)),
		};
	}

	async create({
		userId,
		data,
	}: {
		userId: string;
		data: CreateBudgetDto;
	}): Promise<HttpResponseBodySuccessDto<BudgetResponseDto> | Exception> {
		await this.validateCategory(data.categoryId, userId);

		const existing = await this.budgetsRepository.findByUniqueKey({
			userId,
			categoryId: data.categoryId,
			month: data.month,
			year: data.year,
		});

		if (existing) {
			throw new OptionalException(
				StatusCodes.CONFLICT,
				'Đã tồn tại hạn mức cho danh mục này trong tháng/năm này',
			);
		}

		const newBudget = await this.budgetsRepository.create({
			data: {
				userId,
				categoryId: data.categoryId,
				limitAmount: data.limitAmount,
				month: data.month,
				year: data.year,
			},
		});

		// Trigger recalculation in case there are already expenses
		await this.checkAndUpdateBudget(userId, data.categoryId, data.month, data.year);
		
		// Return updated budget after check
		const updatedBudget = await this.budgetsRepository.findById(newBudget.id);

		return {
			success: true,
			data: new BudgetResponseDto(updatedBudget!),
		};
	}

	async update({
		userId,
		id,
		data,
	}: {
		userId: string;
		id: string;
		data: UpdateBudgetDto;
	}): Promise<HttpResponseBodySuccessDto<BudgetResponseDto> | Exception> {
		const budget = await this.budgetsRepository.findById(id);

		if (!budget || budget.userId !== userId) {
			throw new NotFoundException('budget');
		}

		await this.budgetsRepository.update({
			id,
			data: {
				...(data.limitAmount !== undefined && { limitAmount: data.limitAmount }),
			},
		});

		// Recalculate percentage and alertStatus with the new limitAmount
		await this.checkAndUpdateBudget(userId, budget.categoryId, budget.month, budget.year);

		const updatedBudget = await this.budgetsRepository.findById(id);

		return {
			success: true,
			data: new BudgetResponseDto(updatedBudget!),
		};
	}

	async delete({
		userId,
		id,
	}: {
		userId: string;
		id: string;
	}): Promise<HttpResponseBodySuccessDto<null> | Exception> {
		const budget = await this.budgetsRepository.findById(id);

		if (!budget || budget.userId !== userId) {
			throw new NotFoundException('budget');
		}

		await this.budgetsRepository.delete({ id });

		return {
			success: true,
			data: null,
		};
	}

	/**
	 * Core business logic: update spentAmount and alertStatus.
	 * Can emit NOTIFICATION events if alertStatus goes UP (Normal -> Warning -> Exceeded)
	 */
	public async checkAndUpdateBudget(
		userId: string,
		categoryId: string,
		month: number,
		year: number,
	): Promise<void> {
		const budget = await this.budgetsRepository.findByUniqueKey({
			userId,
			categoryId,
			month,
			year,
		});

		if (!budget) return; // User hasn't set a budget, nothing to do

		const spentDecimal = await this.budgetsRepository.aggregateExpenseSum({
			userId,
			categoryId,
			month,
			year,
		});

		const spent = Number(spentDecimal);
		const limit = Number(budget.limitAmount);
		const percentage = limit > 0 ? (spent / limit) * 100 : 0;

		let newStatus: BudgetAlertStatusEnum = BudgetAlertStatusEnum.NORMAL;
		if (percentage >= 90) {
			newStatus = BudgetAlertStatusEnum.EXCEEDED;
		} else if (percentage >= 70) {
			newStatus = BudgetAlertStatusEnum.WARNING;
		}

		const shouldNotify =
			(budget.alertStatus === BudgetAlertStatusEnum.NORMAL &&
				newStatus !== BudgetAlertStatusEnum.NORMAL) ||
			(budget.alertStatus === BudgetAlertStatusEnum.WARNING &&
				newStatus === BudgetAlertStatusEnum.EXCEEDED);

		await this.budgetsRepository.update({
			id: budget.id,
			data: {
				spentAmount: spentDecimal,
				alertStatus: newStatus,
			},
		});

		if (shouldNotify) {
			const category = await this.categoriesRepository.getCategoryById(categoryId);
			const title = newStatus === BudgetAlertStatusEnum.EXCEEDED ? 'Vượt ngân sách!' : 'Cảnh báo ngân sách!';
			const message = `Chi tiêu danh mục ${category?.name} đã đạt ${percentage.toFixed(1)}% hạn mức tháng ${month}/${year}.`;
			
			// Lazy load to avoid circular dependency if not careful, though direct import is fine here
			const { NotificationsService } = require('@/modules/notifications/notifications.service');
			const notificationsService = new NotificationsService();
			
			await notificationsService.create({
				userId,
				title,
				message,
				type: newStatus === BudgetAlertStatusEnum.EXCEEDED ? 'BUDGET_EXCEEDED' : 'BUDGET_WARNING',
				metadata: {
					budgetId: budget.id,
					categoryId,
					categoryName: category?.name,
					percentage,
				}
			});
		}
	}

	private async handleExpenseMutated(payload: ExpenseMutatedEventPayload) {
		try {
			await this.checkAndUpdateBudget(
				payload.userId,
				payload.categoryId,
				payload.month,
				payload.year,
			);
		} catch (error) {
			console.error('Error in handleExpenseMutated:', error);
		}
	}
}
