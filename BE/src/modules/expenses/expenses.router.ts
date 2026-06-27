import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express from 'express';
import { StatusCodes } from 'http-status-codes';
import z from 'zod';

import { autoBindUtil, validateRequestMiddleware } from '@/common';
import authMiddleware from '@/common/middlewares/auth.middleware';
import { createApiResponse } from '@/swagger/openAPIResponseBuilders';

import { ExpensesController } from './expenses.controller';
import {
	createExpenseRequestSchema,
	createExpenseValidationSchema,
	deleteExpenseValidationSchema,
	expenseIdParamsSchema,
	expenseResponseDtoSchema,
	getExpenseByIdValidationSchema,
	getExpensesQueryObjectSchema,
	getExpensesQueryValidationSchema,
	updateExpenseBodyObjectSchema,
	updateExpenseRequestSchema,
	updateExpenseValidationSchema,
} from './dtos';

export const expensesRegistry = new OpenAPIRegistry();

const expensesController = new ExpensesController();
const router = express.Router({ mergeParams: true });
autoBindUtil(expensesController);


expensesRegistry.registerPath({
	method: 'get',
	path: '/expenses',
	tags: ['Expenses'],
	security: [{ BearerAuth: [] }],
	request: { query: getExpensesQueryObjectSchema },
	responses: createApiResponse(
		z.object({
			data: z.array(expenseResponseDtoSchema),
			pagination: z.object({
				page: z.number(),
				limit: z.number(),
				total: z.number(),
				totalPages: z.number(),
			}),
		}),
		'Success',
	),
});
router.get(
	'/',
	authMiddleware.verifyAccessToken,
	validateRequestMiddleware(getExpensesQueryValidationSchema),
	expensesController.findAll,
);


expensesRegistry.registerPath({
	method: 'get',
	path: '/expenses/{id}',
	tags: ['Expenses'],
	security: [{ BearerAuth: [] }],
	request: { params: expenseIdParamsSchema },
	responses: createApiResponse(expenseResponseDtoSchema, 'Success'),
});
router.get(
	'/:id',
	authMiddleware.verifyAccessToken,
	validateRequestMiddleware(getExpenseByIdValidationSchema),
	expensesController.findById,
);


expensesRegistry.registerPath({
	method: 'post',
	path: '/expenses',
	tags: ['Expenses'],
	security: [{ BearerAuth: [] }],
	request: createExpenseRequestSchema,
	responses: createApiResponse(expenseResponseDtoSchema, 'Created', StatusCodes.CREATED),
});
router.post(
	'/',
	authMiddleware.verifyAccessToken,
	validateRequestMiddleware(createExpenseValidationSchema),
	expensesController.create,
);


expensesRegistry.registerPath({
	method: 'patch',
	path: '/expenses/{id}',
	tags: ['Expenses'],
	security: [{ BearerAuth: [] }],
	request: {
		params: expenseIdParamsSchema,
		...updateExpenseRequestSchema,
	},
	responses: createApiResponse(expenseResponseDtoSchema, 'Success'),
});
router.patch(
	'/:id',
	authMiddleware.verifyAccessToken,
	validateRequestMiddleware(updateExpenseValidationSchema),
	expensesController.update,
);


expensesRegistry.registerPath({
	method: 'delete',
	path: '/expenses/{id}',
	tags: ['Expenses'],
	security: [{ BearerAuth: [] }],
	request: { params: expenseIdParamsSchema },
	responses: createApiResponse(z.null(), 'Soft deleted successfully'),
});
router.delete(
	'/:id',
	authMiddleware.verifyAccessToken,
	validateRequestMiddleware(deleteExpenseValidationSchema),
	expensesController.delete,
);

export const expensesRouter = router;
