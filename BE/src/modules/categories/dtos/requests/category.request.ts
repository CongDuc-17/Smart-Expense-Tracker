import { TransactionTypeEnum } from '@prisma/client';
import z from 'zod';

import { ZodValidationSchema } from '@/common';


export const categoryIdParamsSchema = z.object({
	id: z.string().cuid('ID không hợp lệ'),
});


export const getCategoriesQueryObjectSchema = z.object({
	type: z.nativeEnum(TransactionTypeEnum).optional(),
});

export const getCategoriesQueryValidationSchema: ZodValidationSchema = {
	query: getCategoriesQueryObjectSchema,
};

export const getCategoryByIdValidationSchema: ZodValidationSchema = {
	params: categoryIdParamsSchema,
};


export class CreateCategoryDto {
	name: string;
	type: TransactionTypeEnum;
	icon: string;
	color: string;
}

export const createCategoryBodySchema = z.object({
	name: z
		.string()
		.min(2, 'Tên danh mục phải có ít nhất 2 ký tự')
		.max(50, 'Tên danh mục không được vượt quá 50 ký tự'),
	type: z.nativeEnum(TransactionTypeEnum, {
		message: 'Loại danh mục phải là INCOME hoặc EXPENSE',
	}),
	icon: z.string().min(1, 'Icon là bắt buộc'),
	color: z
		.string()
		.regex(/^#[0-9A-Fa-f]{6}$/, 'Mã màu phải là định dạng Hex (vd: #FF0000)'),
});

export const createCategoryValidationSchema: ZodValidationSchema = {
	body: createCategoryBodySchema,
};

export const createCategoryRequestSchema = {
	body: {
		description: 'Tạo danh mục mới',
		content: {
			'application/json': {
				schema: createCategoryBodySchema,
			},
		},
	},
};


export class UpdateCategoryDto {
	name?: string;
	icon?: string;
	color?: string;
}


export const updateCategoryBodyObjectSchema = z.object({
	name: z.string().min(2, 'Tên danh mục phải có ít nhất 2 ký tự').max(50).optional(),
	icon: z.string().min(1).optional(),
	color: z
		.string()
		.regex(/^#[0-9A-Fa-f]{6}$/, 'Mã màu phải là định dạng Hex (vd: #FF0000)')
		.optional(),
});


export const updateCategoryBodySchema = updateCategoryBodyObjectSchema.refine(
	(data) => Object.values(data).some((v) => v !== undefined),
	{ message: 'Cần ít nhất một trường để cập nhật' },
);

export const updateCategoryValidationSchema: ZodValidationSchema = {
	params: categoryIdParamsSchema,
	body: updateCategoryBodySchema,
};

export const updateCategoryRequestSchema = {
	body: {
		description: 'Cập nhật danh mục',
		content: {
			'application/json': {
				schema: updateCategoryBodyObjectSchema,
			},
		},
	},
};


export const deleteCategoryValidationSchema: ZodValidationSchema = {
	params: categoryIdParamsSchema,
};
