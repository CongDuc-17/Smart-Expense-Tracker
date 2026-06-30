import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express from 'express';
import { StatusCodes } from 'http-status-codes';

import {
	getUserByUserIdRequestSchema,
	getUserByUserIdRequestValidationSchema,
	getUserResponseDtoSchema,
	getUsersRequestSchema,
	getUsersRequestValidationSchema,
	getUsersResponseDtoSchema,
	updateMyInformationRequestSchema,
	updateMyInformationRequestValidationSchema,
	updateMyPasswordRequestSchema,
	updateMyPasswordRequestValidationSchema,
} from './dtos';
import { UsersController } from './users.controller';

import { autoBindUtil, uploadAvatarMiddleware, validateRequestMiddleware } from '@/common';
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
	responses: createApiResponse(getUsersResponseDtoSchema, 'Success', StatusCodes.OK),
});
router.get(
	'/',
	authMiddleware.verifyAccessToken,
	validateRequestMiddleware(getUsersRequestValidationSchema),
	usersController.getUsers,
);

usersRegistry.registerPath({
	method: 'get',
	path: '/users/me',
	tags: ['Users'],
	responses: createApiResponse(getUserResponseDtoSchema, 'Success', StatusCodes.OK),
});
router.get('/me', authMiddleware.verifyAccessToken, usersController.getMyInformation);

usersRegistry.registerPath({
	method: 'put',
	path: '/users/me',
	tags: ['Users'],
	request: updateMyInformationRequestSchema,
	responses: createApiResponse(getUserResponseDtoSchema, 'Success', StatusCodes.OK),
});
router.put(
	'/me',
	authMiddleware.verifyAccessToken,
	uploadAvatarMiddleware.single('avatar'),
	validateRequestMiddleware(updateMyInformationRequestValidationSchema),
	usersController.updateMyInformation,
);

usersRegistry.registerPath({
	method: 'patch',
	path: '/users/me/change-password',
	tags: ['Users'],
	request: updateMyPasswordRequestSchema,
	responses: createApiResponse(getUserResponseDtoSchema, 'Success', StatusCodes.OK),
});
router.patch(
	'/me/change-password',
	authMiddleware.verifyAccessToken,
	validateRequestMiddleware(updateMyPasswordRequestValidationSchema),
	usersController.updateMyPassword,
);

usersRegistry.registerPath({
	method: 'get',
	path: '/users/{userId}',
	tags: ['Users'],
	request: getUserByUserIdRequestSchema,
	responses: createApiResponse(getUserResponseDtoSchema, 'Success', StatusCodes.OK),
});
router.get(
	'/:userId',
	authMiddleware.verifyAccessToken,
	validateRequestMiddleware(getUserByUserIdRequestValidationSchema),
	usersController.getUserByUserId,
);

export const usersRouter = router;
