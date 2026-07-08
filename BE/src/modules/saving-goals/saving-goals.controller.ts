import { Exception } from '@tsed/exceptions';
import { Request } from 'express';

import { CreateSavingGoalDto, DepositSavingGoalDto, UpdateSavingGoalDto } from './dtos';
import { SavingGoalsService } from './saving-goals.service';

import { HttpResponseDto } from '@/common';
import { UserInformationDto } from '@/modules/users/dtos';

export class SavingGoalsController {
	constructor(private readonly savingGoalsService = new SavingGoalsService()) {}

	async findAll(req: Request) {
		const { id: userId } = req.user as UserInformationDto;

		let isCompleted: boolean | undefined = undefined;
		if (req.query.isCompleted === 'true') isCompleted = true;
		else if (req.query.isCompleted === 'false') isCompleted = false;

		const result = await this.savingGoalsService.findAll({ userId, isCompleted });
		return new HttpResponseDto().success(result);
	}

	async findById(req: Request) {
		const { id: userId } = req.user as UserInformationDto;
		const id = req.params.id as string;

		const result = await this.savingGoalsService.findById({ userId, id });
		if (result instanceof Exception) {
			return new HttpResponseDto().exception(result);
		}
		return new HttpResponseDto().success(result);
	}

	async create(req: Request) {
		const { id: userId } = req.user as UserInformationDto;
		const data = req.body as CreateSavingGoalDto;

		const result = await this.savingGoalsService.create({ userId, data });
		return new HttpResponseDto().created(result);
	}

	async update(req: Request) {
		const { id: userId } = req.user as UserInformationDto;
		const id = req.params.id as string;
		const data = req.body as UpdateSavingGoalDto;

		const result = await this.savingGoalsService.update({ userId, id, data });
		if (result instanceof Exception) {
			return new HttpResponseDto().exception(result);
		}
		return new HttpResponseDto().success(result);
	}

	async delete(req: Request) {
		const { id: userId } = req.user as UserInformationDto;
		const id = req.params.id as string;

		const result = await this.savingGoalsService.delete({ userId, id });
		if (result instanceof Exception) {
			return new HttpResponseDto().exception(result);
		}
		return new HttpResponseDto().success(result);
	}

	async deposit(req: Request) {
		const { id: userId } = req.user as UserInformationDto;
		const id = req.params.id as string;
		const data = req.body as DepositSavingGoalDto;

		const result = await this.savingGoalsService.deposit({ userId, id, data });
		if (result instanceof Exception) {
			return new HttpResponseDto().exception(result);
		}
		return new HttpResponseDto().success(result);
	}
}
