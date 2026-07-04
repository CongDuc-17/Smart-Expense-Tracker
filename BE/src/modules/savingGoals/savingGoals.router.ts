import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { autoBindUtil, validateRequestMiddleware } from '@/common';
import authMiddleware from '@/common/middlewares/auth.middleware';
import { createApiResponse } from '@/swagger/openAPIResponseBuilders';

import { SavingGoalsController } from './savingGoals.controller';
import {
    savingGoalIdParamsSchema,
    createSavingGoalRequestSchema,
    createSavingGoalValidationSchema,
    getSavingGoalsQueryObjectSchema,
    getSavingGoalsQueryValidationSchema,
    updateSavingGoalRequestSchema,
    updateSavingGoalValidationSchema,
    createSavingDepositRequestSchema,
    createSavingDepositValidationSchema,
} from './dtos';
import { savingGoalResponseDtoSchema } from './dtos';

export const savingGoalsRegistry = new OpenAPIRegistry();

const savingGoalsController = new SavingGoalsController();
const router = express.Router({ mergeParams: true });
autoBindUtil(savingGoalsController);

// Định nghĩa Swagger cho GET
savingGoalsRegistry.registerPath({
    method: 'get',
    path: '/saving-goals',
    tags: ['SavingGoals'],
    security: [{ BearerAuth: [] }],
    request: { query: getSavingGoalsQueryObjectSchema },
    responses: createApiResponse((savingGoalResponseDtoSchema as any), 'SUCCESS'),
});
router.get(
    '/',
    authMiddleware.verifyAccessToken,
    validateRequestMiddleware(getSavingGoalsQueryValidationSchema),
    savingGoalsController.findAll,
);

// Định nghĩa Swagger cho POST
savingGoalsRegistry.registerPath({
    method: 'post',
    path: '/saving-goals',
    tags: ['SavingGoals'],
    security: [{ BearerAuth: [] }],
    request: createSavingGoalRequestSchema,
    responses: createApiResponse(savingGoalResponseDtoSchema, 'Created', StatusCodes.CREATED),
});
router.post(
    '/',
    authMiddleware.verifyAccessToken,
    validateRequestMiddleware(createSavingGoalValidationSchema),
    savingGoalsController.create,
);

// Định nghĩa Swagger cho PATCH
savingGoalsRegistry.registerPath({
    method: 'patch',
    path: '/saving-goals/{id}',
    tags: ['SavingGoals'],
    security: [{ BearerAuth: [] }],
    request: {
        params: savingGoalIdParamsSchema,
        ...updateSavingGoalRequestSchema,
    },
    responses: createApiResponse(savingGoalResponseDtoSchema, 'Success'),
});
router.patch(
    '/:id',
    authMiddleware.verifyAccessToken,
    validateRequestMiddleware(updateSavingGoalValidationSchema),
    savingGoalsController.update,
);

// Định nghĩa Swagger cho DELETE
savingGoalsRegistry.registerPath({
    method: 'delete',
    path: '/saving-goals/{id}',
    tags: ['SavingGoals'],
    security: [{ BearerAuth: [] }],
    request: { params: savingGoalIdParamsSchema },
    responses: createApiResponse(null, 'Deleted successfully'),
});
router.delete(
    '/:id',
    authMiddleware.verifyAccessToken,
    validateRequestMiddleware({ params: savingGoalIdParamsSchema }),
    savingGoalsController.delete,
);

// Định nghĩa Swagger cho POST Deposit (Lưu ý: dùng /deposits có 's' cho khớp route)
savingGoalsRegistry.registerPath({
    method: 'post',
    path: '/saving-goals/{id}/deposits',
    tags: ['SavingGoals'],
    security: [{ BearerAuth: [] }],
    request: {
        params: savingGoalIdParamsSchema,
        ...createSavingDepositRequestSchema,
    },
    responses: createApiResponse(savingGoalResponseDtoSchema, 'Success'),
});
router.post(
    '/:id/deposits',
    authMiddleware.verifyAccessToken,
    validateRequestMiddleware(createSavingDepositValidationSchema),
    savingGoalsController.createDeposit,
);

export const savingGoalsRouter = router;