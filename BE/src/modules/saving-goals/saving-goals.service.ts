import { Exception } from '@tsed/exceptions';

import { HttpResponseBodySuccessDto, NotFoundException } from '@/common';
import { AppEvents, eventBus, GoalReachedEventPayload } from '@/common/events';

import {
	CreateSavingGoalDto,
	DepositSavingGoalDto,
	SavingDepositResponseDto,
	SavingGoalResponseDto,
	UpdateSavingGoalDto,
} from './dtos';
import { SavingGoalsRepository } from './saving-goals.repository';

export class SavingGoalsService {
	constructor(private readonly savingGoalsRepository = new SavingGoalsRepository()) {}

	async findAll({
		userId,
		isCompleted,
	}: {
		userId: string;
		isCompleted?: boolean;
	}): Promise<HttpResponseBodySuccessDto<SavingGoalResponseDto[]>> {
		const goals = await this.savingGoalsRepository.findMany({ userId, isCompleted });

		return {
			success: true,
			data: goals.map((g) => new SavingGoalResponseDto(g)),
		};
	}

	async findById({
		userId,
		id,
	}: {
		userId: string;
		id: string;
	}): Promise<HttpResponseBodySuccessDto<SavingGoalResponseDto> | Exception> {
		const goal = await this.savingGoalsRepository.findById(id);

		if (!goal || goal.userId !== userId) {
			throw new NotFoundException('saving goal');
		}

		return {
			success: true,
			data: new SavingGoalResponseDto(goal),
		};
	}

	async create({
		userId,
		data,
	}: {
		userId: string;
		data: CreateSavingGoalDto;
	}): Promise<HttpResponseBodySuccessDto<SavingGoalResponseDto>> {
		const goal = await this.savingGoalsRepository.create({
			data: {
				userId,
				title: data.title,
				targetAmount: data.targetAmount,
				deadline: data.deadline,
				note: data.note,
			},
		});

		return {
			success: true,
			data: new SavingGoalResponseDto(goal),
		};
	}

	async update({
		userId,
		id,
		data,
	}: {
		userId: string;
		id: string;
		data: UpdateSavingGoalDto;
	}): Promise<HttpResponseBodySuccessDto<SavingGoalResponseDto> | Exception> {
		const goal = await this.savingGoalsRepository.findById(id);

		if (!goal || goal.userId !== userId) {
			throw new NotFoundException('saving goal');
		}

		// Calculate new isCompleted if targetAmount is provided
		let isCompleted = goal.isCompleted;
		if (data.targetAmount !== undefined) {
			const saved = Number(goal.savedAmount);
			const target = data.targetAmount;
			isCompleted = saved >= target;
		}

		const updatedGoal = await this.savingGoalsRepository.update({
			id,
			data: {
				...(data.title !== undefined && { title: data.title }),
				...(data.targetAmount !== undefined && { targetAmount: data.targetAmount }),
				...(data.deadline !== undefined && { deadline: data.deadline }),
				...(data.note !== undefined && { note: data.note }),
				isCompleted,
			},
		});

		return {
			success: true,
			data: new SavingGoalResponseDto(updatedGoal),
		};
	}

	async delete({
		userId,
		id,
	}: {
		userId: string;
		id: string;
	}): Promise<HttpResponseBodySuccessDto<null> | Exception> {
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

	async deposit({
		userId,
		id,
		data,
	}: {
		userId: string;
		id: string;
		data: DepositSavingGoalDto;
	}): Promise<
		| HttpResponseBodySuccessDto<{
				savingGoal: SavingGoalResponseDto;
				deposit: SavingDepositResponseDto;
		  }>
		| Exception
	> {
		const goal = await this.savingGoalsRepository.findById(id);

		if (!goal || goal.userId !== userId) {
			throw new NotFoundException('saving goal');
		}

		const result = await this.savingGoalsRepository.deposit({
			id,
			userId,
			goalTitle: goal.title,
			amount: data.amount,
			note: data.note,
		});

		let updatedGoal = result.updatedGoal;

		// Check for completion AFTER deposit
		const saved = Number(updatedGoal.savedAmount);
		const target = Number(updatedGoal.targetAmount);

		if (saved >= target && !updatedGoal.isCompleted) {
			updatedGoal = await this.savingGoalsRepository.update({
				id,
				data: { isCompleted: true },
			});

			const payload: GoalReachedEventPayload = {
				userId,
				goalId: id,
				title: updatedGoal.title,
			};
			eventBus.emit(AppEvents.GOAL_REACHED, payload);
		}

		return {
			success: true,
			data: {
				savingGoal: new SavingGoalResponseDto(updatedGoal),
				deposit: new SavingDepositResponseDto(result.deposit),
			},
		};
	}
}
