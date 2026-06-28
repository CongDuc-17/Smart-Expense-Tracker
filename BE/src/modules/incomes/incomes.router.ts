import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express from 'express';
import { StatusCodes } from 'http-status-codes';
import z from 'zod';

import { autoBindUtil, validateRequestMiddleware } from '@/common';
import authMiddleware from '@/common/middlewares/auth.middleware';
import { createApiResponse } from '@/swagger/openAPIResponseBuilders';

import { IncomesController } from './incomes.controller';
import {
	createIncomeRequestSchema,
	createIncomeValidationSchema,
	deleteIncomeValidationSchema,
	getIncomeByIdValidationSchema,
	getIncomesQueryObjectSchema,
	getIncomesQueryValidationSchema,
	incomeIdParamsSchema,
	incomeResponseDtoSchema,
	updateIncomeBodyObjectSchema,
	updateIncomeRequestSchema,
	updateIncomeValidationSchema,
} from './dtos';

export const incomesRegistry = new OpenAPIRegistry();

const incomesController = new IncomesController();
const router = express.Router({ mergeParams: true });
autoBindUtil(incomesController);


incomesRegistry.registerPath({
	method: 'get',
	path: '/incomes',
	tags: ['Incomes'],
	security: [{ BearerAuth: [] }],
	request: { query: getIncomesQueryObjectSchema },
	responses: createApiResponse(
		z.object({
			data: z.array(incomeResponseDtoSchema),
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
	validateRequestMiddleware(getIncomesQueryValidationSchema),
	incomesController.findAll,
);


incomesRegistry.registerPath({
	method: 'get',
	path: '/incomes/{id}',
	tags: ['Incomes'],
	security: [{ BearerAuth: [] }],
	request: { params: incomeIdParamsSchema },
	responses: createApiResponse(incomeResponseDtoSchema, 'Success'),
});
router.get(
	'/:id',
	authMiddleware.verifyAccessToken,
	validateRequestMiddleware(getIncomeByIdValidationSchema),
	incomesController.findById,
);


incomesRegistry.registerPath({
	method: 'post',
	path: '/incomes',
	tags: ['Incomes'],
	security: [{ BearerAuth: [] }],
	request: createIncomeRequestSchema,
	responses: createApiResponse(incomeResponseDtoSchema, 'Created', StatusCodes.CREATED),
});
router.post(
	'/',
	authMiddleware.verifyAccessToken,
	validateRequestMiddleware(createIncomeValidationSchema),
	incomesController.create,
);


incomesRegistry.registerPath({
	method: 'patch',
	path: '/incomes/{id}',
	tags: ['Incomes'],
	security: [{ BearerAuth: [] }],
	request: {
		params: incomeIdParamsSchema,
		...updateIncomeRequestSchema,
	},
	responses: createApiResponse(incomeResponseDtoSchema, 'Success'),
});
router.patch(
	'/:id',
	authMiddleware.verifyAccessToken,
	validateRequestMiddleware(updateIncomeValidationSchema),
	incomesController.update,
);


incomesRegistry.registerPath({
	method: 'delete',
	path: '/incomes/{id}',
	tags: ['Incomes'],
	security: [{ BearerAuth: [] }],
	request: { params: incomeIdParamsSchema },
	responses: createApiResponse(z.null(), 'Soft deleted successfully'),
});
router.delete(
	'/:id',
	authMiddleware.verifyAccessToken,
	validateRequestMiddleware(deleteIncomeValidationSchema),
	incomesController.delete,
);

export const incomesRouter = router;
