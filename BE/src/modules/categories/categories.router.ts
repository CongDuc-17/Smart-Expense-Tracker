import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express from 'express';
import { StatusCodes } from 'http-status-codes';
import z from 'zod';

import { CategoriesController } from './categories.controller';
import {
	categoryIdParamsSchema,
	categoryResponseDtoSchema,
	createCategoryRequestSchema,
	createCategoryValidationSchema,
	deleteCategoryValidationSchema,
	getCategoriesQueryObjectSchema,
	getCategoriesQueryValidationSchema,
	getCategoryByIdValidationSchema,
	updateCategoryRequestSchema,
	updateCategoryValidationSchema,
} from './dtos';

import { autoBindUtil, validateRequestMiddleware } from '@/common';
import authMiddleware from '@/common/middlewares/auth.middleware';
import { createApiResponse } from '@/swagger/openAPIResponseBuilders';

export const categoriesRegistry = new OpenAPIRegistry();

const categoriesController = new CategoriesController();
const router = express.Router({ mergeParams: true });
autoBindUtil(categoriesController);

categoriesRegistry.registerPath({
	method: 'get',
	path: '/categories',
	tags: ['Categories'],
	security: [{ BearerAuth: [] }],
	request: {
		query: getCategoriesQueryObjectSchema,
	},
	responses: createApiResponse(z.array(categoryResponseDtoSchema), 'Success'),
});
router.get(
	'/',
	authMiddleware.verifyAccessToken,
	validateRequestMiddleware(getCategoriesQueryValidationSchema),
	categoriesController.getCategories,
);

categoriesRegistry.registerPath({
	method: 'get',
	path: '/categories/{id}',
	tags: ['Categories'],
	security: [{ BearerAuth: [] }],
	request: {
		params: categoryIdParamsSchema,
	},
	responses: createApiResponse(categoryResponseDtoSchema, 'Success'),
});
router.get(
	'/:id',
	authMiddleware.verifyAccessToken,
	validateRequestMiddleware(getCategoryByIdValidationSchema),
	categoriesController.getCategoryById,
);

categoriesRegistry.registerPath({
	method: 'post',
	path: '/categories',
	tags: ['Categories'],
	security: [{ BearerAuth: [] }],
	request: createCategoryRequestSchema,
	responses: createApiResponse(
		categoryResponseDtoSchema,
		'Created',
		StatusCodes.CREATED,
	),
});
router.post(
	'/',
	authMiddleware.verifyAccessToken,
	validateRequestMiddleware(createCategoryValidationSchema),
	categoriesController.createCategory,
);

categoriesRegistry.registerPath({
	method: 'patch',
	path: '/categories/{id}',
	tags: ['Categories'],
	security: [{ BearerAuth: [] }],
	request: {
		params: categoryIdParamsSchema,
		...updateCategoryRequestSchema,
	},
	responses: createApiResponse(categoryResponseDtoSchema, 'Success'),
});
router.patch(
	'/:id',
	authMiddleware.verifyAccessToken,
	validateRequestMiddleware(updateCategoryValidationSchema),
	categoriesController.updateCategory,
);

categoriesRegistry.registerPath({
	method: 'delete',
	path: '/categories/{id}',
	tags: ['Categories'],
	security: [{ BearerAuth: [] }],
	request: {
		params: categoryIdParamsSchema,
	},
	responses: createApiResponse(z.null(), 'Success'),
});
router.delete(
	'/:id',
	authMiddleware.verifyAccessToken,
	validateRequestMiddleware(deleteCategoryValidationSchema),
	categoriesController.deleteCategory,
);

export const categoriesRouter = router;
