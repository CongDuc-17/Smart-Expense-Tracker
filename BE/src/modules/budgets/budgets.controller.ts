import { Exception } from '@tsed/exceptions';
import { Request } from 'express';

import { BudgetsService } from './budgets.service';
import { CreateBudgetDto, UpdateBudgetDto } from './dtos';

import { HttpResponseDto } from '@/common';
import { UserInformationDto } from '@/modules/users/dtos';

export class BudgetsController {
	constructor(private readonly budgetsService = new BudgetsService()) {}

	async findAll(req: Request) {
		const { id: userId } = req.user as UserInformationDto;
		const month = Number(req.query.month);
		const year = Number(req.query.year);

		const result = await this.budgetsService.findAll({ userId, month, year });
		return new HttpResponseDto().success(result);
	}

	async create(req: Request) {
		const { id: userId } = req.user as UserInformationDto;
		const data = req.body as CreateBudgetDto;

		const result = await this.budgetsService.create({ userId, data });
		if (result instanceof Exception) {
			return new HttpResponseDto().exception(result);
		}
		return new HttpResponseDto().created(result);
	}

	async update(req: Request) {
		const { id: userId } = req.user as UserInformationDto;
		const id = req.params.id as string;
		const data = req.body as UpdateBudgetDto;

		const result = await this.budgetsService.update({ userId, id, data });
		if (result instanceof Exception) {
			return new HttpResponseDto().exception(result);
		}
		return new HttpResponseDto().success(result);
	}

	async delete(req: Request) {
		const { id: userId } = req.user as UserInformationDto;
		const id = req.params.id as string;

		const result = await this.budgetsService.delete({ userId, id });
		if (result instanceof Exception) {
			return new HttpResponseDto().exception(result);
		}
		return new HttpResponseDto().success(result);
	}
}
