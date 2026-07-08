import { Exception } from '@tsed/exceptions';
import { Request } from 'express';

import { CreateExpenseDto, UpdateExpenseDto } from './dtos';
import { ExpensesService } from './expenses.service';

import { HttpResponseDto } from '@/common';
import { UserInformationDto } from '@/modules/users/dtos';

export class ExpensesController {
	constructor(private readonly expensesService = new ExpensesService()) {}

	async findAll(req: Request) {
		const { id: userId } = req.user as UserInformationDto;
		const { month, year, categoryId, page, limit } = req.query as {
			month?: string;
			year?: string;
			categoryId?: string;
			page?: string;
			limit?: string;
		};

		const result = await this.expensesService.findAll({
			userId,
			month: month ? Number(month) : undefined,
			year: year ? Number(year) : undefined,
			categoryId,
			page: page ? Number(page) : 1,
			limit: limit ? Number(limit) : 20,
		});

		return new HttpResponseDto().success(result as never);
	}

	async findById(req: Request) {
		const { id: userId } = req.user as UserInformationDto;
		const id = req.params.id as string;

		const result = await this.expensesService.findById({ userId, id });
		if (result instanceof Exception) {
			return new HttpResponseDto().exception(result);
		}
		return new HttpResponseDto().success(result);
	}

	async create(req: Request) {
		const { id: userId } = req.user as UserInformationDto;
		const data = req.body as CreateExpenseDto;

		const result = await this.expensesService.create({ userId, data });
		if (result instanceof Exception) {
			return new HttpResponseDto().exception(result);
		}
		return new HttpResponseDto().created(result);
	}

	async update(req: Request) {
		const { id: userId } = req.user as UserInformationDto;
		const id = req.params.id as string;
		const data = req.body as UpdateExpenseDto;

		const result = await this.expensesService.update({ userId, id, data });
		if (result instanceof Exception) {
			return new HttpResponseDto().exception(result);
		}
		return new HttpResponseDto().success(result);
	}

	async delete(req: Request) {
		const { id: userId } = req.user as UserInformationDto;
		const id = req.params.id as string;

		const result = await this.expensesService.delete({ userId, id });
		if (result instanceof Exception) {
			return new HttpResponseDto().exception(result);
		}
		return new HttpResponseDto().success(result);
	}
}
