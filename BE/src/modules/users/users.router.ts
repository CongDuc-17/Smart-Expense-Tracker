import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express from 'express';
import { StatusCodes } from 'http-status-codes';
import z from 'zod';

import { getUsersRequestSchema, getUsersRequestValidationSchema } from './dtos';
import { UsersController } from './users.controller';

import { autoBindUtil, validateRequestMiddleware } from '@/common';
import authMiddleware from '@/common/middlewares/auth.middleware';
import { createApiResponse } from '@/swagger/openAPIResponseBuilders';

const usersController = new UsersController();

export const usersRegistry = new OpenAPIRegistry();

const router = express.Router({ mergeParams: true });
autoBindUtil(usersController);

usersRegistry.registerPath({
	method: 'get',
	path: '/users',
	tags: ['Users'],
	request: getUsersRequestSchema,
	responses: createApiResponse(z.null(), 'Success', StatusCodes.OK),
});

router.get(
	'/',
	authMiddleware.verifyAccessToken,
	validateRequestMiddleware(getUsersRequestValidationSchema),
	usersController.getUsers,
);

export const usersRouter = router;
