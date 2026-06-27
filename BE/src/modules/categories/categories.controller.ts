import { TransactionTypeEnum } from '@prisma/client';
import { Exception } from '@tsed/exceptions';
import { Request } from 'express';

import { HttpResponseDto } from '@/common';
import { UserInformationDto } from '@/modules/users/dtos';

import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dtos';

export class CategoriesController {
	constructor(private readonly categoriesService = new CategoriesService()) { }


	async getCategories(req: Request) {
		const { id: userId } = req.user as UserInformationDto;
		const type = req.query.type as TransactionTypeEnum | undefined;

		const result = await this.categoriesService.findAll({ userId, type });
		if (result instanceof Exception) {
			return new HttpResponseDto().exception(result);
		}
		return new HttpResponseDto().success(result);
	}


	async getCategoryById(req: Request) {
		const { id: userId } = req.user as UserInformationDto;
		const categoryId = req.params.id as string;

		const result = await this.categoriesService.findOne({ userId, categoryId });
		if (result instanceof Exception) {
			return new HttpResponseDto().exception(result);
		}
		return new HttpResponseDto().success(result);
	}


	async createCategory(req: Request) {
		const { id: userId } = req.user as UserInformationDto;
		const data = req.body as CreateCategoryDto;

		const result = await this.categoriesService.create({ userId, data });
		if (result instanceof Exception) {
			return new HttpResponseDto().exception(result);
		}
		return new HttpResponseDto().created(result);
	}


	async updateCategory(req: Request) {
		const { id: userId } = req.user as UserInformationDto;
		const categoryId = req.params.id as string;
		const data = req.body as UpdateCategoryDto;

		const result = await this.categoriesService.update({ userId, categoryId, data });
		if (result instanceof Exception) {
			return new HttpResponseDto().exception(result);
		}
		return new HttpResponseDto().success(result);
	}


	async deleteCategory(req: Request) {
		const { id: userId } = req.user as UserInformationDto;
		const categoryId = req.params.id as string;

		const result = await this.categoriesService.delete({ userId, categoryId });
		if (result instanceof Exception) {
			return new HttpResponseDto().exception(result);
		}
		return new HttpResponseDto().success(result);
	}
}
