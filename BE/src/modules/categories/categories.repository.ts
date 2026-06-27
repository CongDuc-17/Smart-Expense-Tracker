import { TransactionTypeEnum } from '@prisma/client';

import { Prisma, PrismaService } from '../database';

export class CategoriesRepository {
	constructor(private readonly prismaService = new PrismaService()) { }

	async getCategories(userId: string, type?: TransactionTypeEnum) {
		return this.prismaService.category.findMany({
			where: {
				OR: [{ isDefault: true }, { userId: userId }],
				...(type ? { type } : {}),
			},
			orderBy: { name: 'asc' },
		});
	}


	async getCategoryById(categoryId: string) {
		return this.prismaService.category.findUnique({
			where: { id: categoryId },
			include: {
				_count: {
					select: {
						expenses: true,
						incomes: true,
						budgets: true,
					},
				},
			},
		});
	}

	async createCategory({ category }: { category: Prisma.CategoryCreateInput }) {
		return this.prismaService.category.create({
			data: category,
		});
	}


	async updateCategory({
		categoryId,
		data,
	}: {
		categoryId: string;
		data: Prisma.CategoryUpdateInput;
	}) {
		return this.prismaService.category.update({
			where: { id: categoryId },
			data,
		});
	}

	async deleteCategory({ categoryId }: { categoryId: string }) {
		return this.prismaService.category.delete({
			where: { id: categoryId },
		});
	}
}
