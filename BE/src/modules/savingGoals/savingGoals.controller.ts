import { Request } from 'express';
import { Exception } from '@tsed/exceptions';

import { HttpResponseDto } from '@/common';
import { SavingGoalsService } from './savingGoals.service';
import { CreateSavingGoalDto, UpdateSavingGoalDto } from './dtos';

export class SavingGoalsController {
	constructor(private readonly savingGoalsService = new SavingGoalsService()) {}

	async findAll(req: Request) {
		const { id: userId } = req.user as { id: string };
		const result = await this.savingGoalsService.findAll({ userId });
		return new HttpResponseDto().success(result);
	}

	async create(req: Request) {
		const { id: userId } = req.user as { id: string };
		const data = req.body as CreateSavingGoalDto;
		const result = await this.savingGoalsService.create({ userId, data });
		return new HttpResponseDto().created(result);
	}

	async update(req: Request) {
		const { id: userId } = req.user as { id: string };
		const goalId = req.params.id as string;
		const data = req.body as UpdateSavingGoalDto;
		const result = await this.savingGoalsService.update({ userId, id: goalId, data });
		if (result instanceof Exception) {
			return new HttpResponseDto().exception(result);
		}
		return new HttpResponseDto().success(result);
	}

	async delete(req: Request) {
		const { id: userId } = req.user as { id: string };
		const goalId = req.params.id as string;
		const result = await this.savingGoalsService.delete({ userId, id: goalId });
		if (result instanceof Exception) {
			return new HttpResponseDto().exception(result);
		}
		return new HttpResponseDto().success(result);
	}

	async createDeposit(req: Request) {
		const { id: userId } = req.user as { id: string };
		const goalId = req.params.id as string;
		const { amount, note } = req.body as { amount: number; note?: string };
		const result = await this.savingGoalsService.createDeposit({
			userId,
			goalId,
			amount,
			note,
		});
		if (result instanceof Exception) {
			return new HttpResponseDto().exception(result);
		}
		return new HttpResponseDto().success(result);
	}
}
