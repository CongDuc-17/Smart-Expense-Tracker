import { Prisma, PrismaService } from '../database';
import { Exception } from '@tsed/exceptions';
import { StatusCodes } from 'http-status-codes';

import {
	ForbiddenException,
	HttpResponseBodySuccessDto,
	NotFoundException,
	OptionalException,
} from '@/common';
import { AppEvents, eventBus } from '@/common/events';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { SavingGoalResponseDto, CreateSavingGoalDto, UpdateSavingGoalDto } from './dtos';
import { SavingGoalsRepository } from './savingGoals.repository';

export class SavingGoalsService {
	constructor(
		private readonly savingGoalsRepository = new SavingGoalsRepository(),
		private readonly notificationsService = new NotificationsService(),
	) {}

	async findAll({ userId }: { userId: string }) {
		const goals = await this.savingGoalsRepository.findMany({ userId });

		return {
			success: true,
			data: goals.map((goal) => new SavingGoalResponseDto(goal)),
		};
	}

	async create({ userId, data }: { userId: string; data: CreateSavingGoalDto }) {
		const newGoal = await this.savingGoalsRepository.create({
			data: {
				userId,
				title: data.title,
				targetAmount: new Prisma.Decimal(data.targetAmount),
				deadline: data.deadline,
				note: data.note,
			},
		});

		return {
			success: true,
			data: new SavingGoalResponseDto(newGoal),
		};
	}

	async update({ userId, id, data }: { userId: string; id: string; data: UpdateSavingGoalDto }) {
		const goal = await this.savingGoalsRepository.findById(id);

		if (!goal || goal.userId !== userId) {
			throw new NotFoundException('saving goal');
		}

		const updated = await this.savingGoalsRepository.update({
			id,
			data: {
				...(data.title !== undefined && { title: data.title }),
				...(data.targetAmount !== undefined && { targetAmount: new Prisma.Decimal(data.targetAmount) }),
				...(data.deadline !== undefined && { deadline: data.deadline }),
				...(data.note !== undefined && { note: data.note }),
			},
		});

		return {
			success: true,
			data: new SavingGoalResponseDto(updated),
		};
	}

	async delete({ userId, id }: { userId: string; id: string }) {
		const goal = await this.savingGoalsRepository.findById(id);

		if (!goal || goal.userId !== userId) {
			throw new NotFoundException('saving goal');
		}

		await this.savingGoalsRepository.delete({ id });

		return {
			success: true,
			data: null,
		};
	}

	async createDeposit({ userId, goalId, amount, note }: { userId: string; goalId: string; amount: number; note?: string }) {
		const goal = await this.savingGoalsRepository.findById(goalId);

		if (!goal || goal.userId !== userId) {
			throw new NotFoundException('saving goal');
		}

		const deposit = await this.savingGoalsRepository.createDeposit({
			data: {
				savingGoalId: goalId,
				amount: new Prisma.Decimal(amount),
				note,
			},
		});

		const updatedSavedAmount = Number(goal.savedAmount) + amount;
		const isCompleted = updatedSavedAmount >= Number(goal.targetAmount);

		await this.savingGoalsRepository.update({
			id: goalId,
			data: {
				savedAmount: new Prisma.Decimal(updatedSavedAmount),
				isCompleted,
			},
		});

		if (isCompleted && !goal.isCompleted) {
			eventBus.emit(AppEvents.GOAL_REACHED, {
				userId,
				goalId: goal.id,
				title: goal.title,
			});
		}

		return {
			success: true,
			data: new SavingGoalResponseDto({
				...goal,
				savedAmount: new Prisma.Decimal(updatedSavedAmount),
				isCompleted,
			} as any),
		};
	}
}
