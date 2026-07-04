import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express from 'express';
import { StatusCodes } from 'http-status-codes';
import z from 'zod';

import { autoBindUtil, validateRequestMiddleware } from '@/common';
import authMiddleware from '@/common/middlewares/auth.middleware';
import { createApiResponse } from '@/swagger/openAPIResponseBuilders';

import { BudgetsController } from './budgets.controller';
import {
	budgetIdParamsSchema,
	budgetResponseDtoSchema,
	createBudgetRequestSchema,
	createBudgetValidationSchema,
	deleteBudgetValidationSchema,
	getBudgetsQueryObjectSchema,
	getBudgetsQueryValidationSchema,
	updateBudgetRequestSchema,
	updateBudgetValidationSchema,
} from './dtos';

export const budgetsRegistry = new OpenAPIRegistry();

const budgetsController = new BudgetsController();
const router = express.Router({ mergeParams: true });
autoBindUtil(budgetsController);

// ─── GET /budgets ─────────────────────────────────────────────────────────────
budgetsRegistry.registerPath({
	method: 'get',
	path: '/budgets',
	tags: ['Budgets'],
	security: [{ BearerAuth: [] }],
	request: { query: getBudgetsQueryObjectSchema },
	responses: createApiResponse(z.array(budgetResponseDtoSchema), 'Success'),
});
router.get(
	'/',
	authMiddleware.verifyAccessToken,
	validateRequestMiddleware(getBudgetsQueryValidationSchema),
	budgetsController.findAll,
);

// ─── POST /budgets ────────────────────────────────────────────────────────────
budgetsRegistry.registerPath({
	method: 'post',
	path: '/budgets',
	tags: ['Budgets'],
	security: [{ BearerAuth: [] }],
	request: createBudgetRequestSchema,
	responses: createApiResponse(budgetResponseDtoSchema, 'Created', StatusCodes.CREATED),
});
router.post(
	'/',
	authMiddleware.verifyAccessToken,
	validateRequestMiddleware(createBudgetValidationSchema),
	budgetsController.create,
);

// ─── PATCH /budgets/:id ───────────────────────────────────────────────────────
budgetsRegistry.registerPath({
	method: 'patch',
	path: '/budgets/{id}',
	tags: ['Budgets'],
	security: [{ BearerAuth: [] }],
	request: {
		params: budgetIdParamsSchema,
		...updateBudgetRequestSchema,
	},
	responses: createApiResponse(budgetResponseDtoSchema, 'Success'),
});
router.patch(
	'/:id',
	authMiddleware.verifyAccessToken,
	validateRequestMiddleware(updateBudgetValidationSchema),
	budgetsController.update,
);

// ─── DELETE /budgets/:id ──────────────────────────────────────────────────────
budgetsRegistry.registerPath({
	method: 'delete',
	path: '/budgets/{id}',
	tags: ['Budgets'],
	security: [{ BearerAuth: [] }],
	request: { params: budgetIdParamsSchema },
	responses: createApiResponse(z.null(), 'Deleted successfully'),
});
router.delete(
	'/:id',
	authMiddleware.verifyAccessToken,
	validateRequestMiddleware(deleteBudgetValidationSchema),
	budgetsController.delete,
);

export const budgetsRouter = router;
