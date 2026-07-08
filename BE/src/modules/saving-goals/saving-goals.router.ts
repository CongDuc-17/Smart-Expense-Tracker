import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express from 'express';
import { StatusCodes } from 'http-status-codes';
import z from 'zod';

import {
	createSavingGoalRequestSchema,
	createSavingGoalValidationSchema,
	deleteSavingGoalValidationSchema,
	depositSavingGoalRequestSchema,
	depositSavingGoalValidationSchema,
	getSavingGoalsQueryObjectSchema,
	getSavingGoalsQueryValidationSchema,
	savingDepositResponseSchema,
	savingGoalIdParamsSchema,
	savingGoalResponseSchema,
	updateSavingGoalRequestSchema,
	updateSavingGoalValidationSchema,
} from './dtos';
import { SavingGoalsController } from './saving-goals.controller';

import { autoBindUtil, validateRequestMiddleware } from '@/common';
import authMiddleware from '@/common/middlewares/auth.middleware';
import { createApiResponse } from '@/swagger/openAPIResponseBuilders';

export const savingGoalsRegistry = new OpenAPIRegistry();

const savingGoalsController = new SavingGoalsController();
const router = express.Router({ mergeParams: true });
autoBindUtil(savingGoalsController);

// ─── GET /saving-goals ────────────────────────────────────────────────────────
savingGoalsRegistry.registerPath({
	method: 'get',
	path: '/saving-goals',
	tags: ['Saving Goals'],
	security: [{ BearerAuth: [] }],
	request: { query: getSavingGoalsQueryObjectSchema },
	responses: createApiResponse(z.array(savingGoalResponseSchema), 'Success'),
});
router.get(
	'/',
	authMiddleware.verifyAccessToken,
	validateRequestMiddleware(getSavingGoalsQueryValidationSchema),
	savingGoalsController.findAll,
);

// ─── POST /saving-goals ───────────────────────────────────────────────────────
savingGoalsRegistry.registerPath({
	method: 'post',
	path: '/saving-goals',
	tags: ['Saving Goals'],
	security: [{ BearerAuth: [] }],
	request: createSavingGoalRequestSchema,
	responses: createApiResponse(
		savingGoalResponseSchema,
		'Created',
		StatusCodes.CREATED,
	),
});
router.post(
	'/',
	authMiddleware.verifyAccessToken,
	validateRequestMiddleware(createSavingGoalValidationSchema),
	savingGoalsController.create,
);

// ─── GET /saving-goals/:id ────────────────────────────────────────────────────
savingGoalsRegistry.registerPath({
	method: 'get',
	path: '/saving-goals/{id}',
	tags: ['Saving Goals'],
	security: [{ BearerAuth: [] }],
	request: { params: savingGoalIdParamsSchema },
	responses: createApiResponse(savingGoalResponseSchema, 'Success'),
});
router.get(
	'/:id',
	authMiddleware.verifyAccessToken,
	validateRequestMiddleware({ params: savingGoalIdParamsSchema }), // No extra body/query validation needed
	savingGoalsController.findById,
);

// ─── PATCH /saving-goals/:id ──────────────────────────────────────────────────
savingGoalsRegistry.registerPath({
	method: 'patch',
	path: '/saving-goals/{id}',
	tags: ['Saving Goals'],
	security: [{ BearerAuth: [] }],
	request: {
		params: savingGoalIdParamsSchema,
		...updateSavingGoalRequestSchema,
	},
	responses: createApiResponse(savingGoalResponseSchema, 'Success'),
});
router.patch(
	'/:id',
	authMiddleware.verifyAccessToken,
	validateRequestMiddleware(updateSavingGoalValidationSchema),
	savingGoalsController.update,
);

// ─── DELETE /saving-goals/:id ─────────────────────────────────────────────────
savingGoalsRegistry.registerPath({
	method: 'delete',
	path: '/saving-goals/{id}',
	tags: ['Saving Goals'],
	security: [{ BearerAuth: [] }],
	request: { params: savingGoalIdParamsSchema },
	responses: createApiResponse(z.null(), 'Deleted successfully'),
});
router.delete(
	'/:id',
	authMiddleware.verifyAccessToken,
	validateRequestMiddleware(deleteSavingGoalValidationSchema),
	savingGoalsController.delete,
);

// ─── PATCH /saving-goals/:id/deposit ──────────────────────────────────────────
savingGoalsRegistry.registerPath({
	method: 'patch',
	path: '/saving-goals/{id}/deposit',
	tags: ['Saving Goals'],
	security: [{ BearerAuth: [] }],
	request: {
		params: savingGoalIdParamsSchema,
		...depositSavingGoalRequestSchema,
	},
	responses: createApiResponse(
		z.object({
			savingGoal: savingGoalResponseSchema,
			deposit: savingDepositResponseSchema,
		}),
		'Success',
	),
});
router.patch(
	'/:id/deposit',
	authMiddleware.verifyAccessToken,
	validateRequestMiddleware(depositSavingGoalValidationSchema),
	savingGoalsController.deposit,
);

export const savingGoalsRouter = router;
