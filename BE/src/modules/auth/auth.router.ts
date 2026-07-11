import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express from 'express';
import { StatusCodes } from 'http-status-codes';
import z from 'zod';

import { AuthController } from './auth.controller';
import {
	registerRequestSchema,
	accountResponseDtoSchema,
	registerRequestValidationSchema,
	loginRequestSchema,
	loginResponseDtoSchema,
	loginRequestValidationSchema,
	sendOtpRequestSchema,
	sendOtpRequestValidationSchema,
	verifyRequestSchema,
	verifyRequestValidationSchema,
	forgotPasswordRequestSchema,
	forgotPasswordRequestValidationSchema,
} from './dtos';
import { GoogleOauthStrategy } from './strategies/googleOauth.strategy';

import { autoBindUtil, validateRequestMiddleware } from '@/common';
import authMiddleware from '@/common/middlewares/auth.middleware';
import { createApiResponse } from '@/swagger/openAPIResponseBuilders';

export const authRegistry = new OpenAPIRegistry();

const authController = new AuthController();
const router = express.Router({ mergeParams: true });
autoBindUtil(authController);

new GoogleOauthStrategy();

authRegistry.registerPath({
	method: 'post',
	path: '/auth/register',
	tags: ['Auth'],
	request: registerRequestSchema,
	responses: createApiResponse(
		accountResponseDtoSchema,
		'Success',
		StatusCodes.CREATED,
	),
});
router.post(
	'/register',
	validateRequestMiddleware(registerRequestValidationSchema),
	authController.register,
);

authRegistry.registerPath({
	method: 'post',
	path: '/auth/login',
	tags: ['Auth'],
	request: loginRequestSchema,
	responses: createApiResponse(loginResponseDtoSchema, 'Success'),
});
router.post(
	'/login',
	validateRequestMiddleware(loginRequestValidationSchema),
	authController.login,
);

authRegistry.registerPath({
	method: 'get',
	path: '/auth/google/login',
	tags: ['Auth'],
	responses: createApiResponse(z.null(), 'Success'),
});
router.get('/google/login', authController.googleAuth);

authRegistry.registerPath({
	method: 'get',
	path: '/auth/google/check-login',
	tags: ['Auth'],
	responses: createApiResponse(z.null(), 'Success'),
});
router.get('/google/check-login', authController.googleCallback);

authRegistry.registerPath({
	method: 'get',
	path: '/auth/google/login/failure',
	tags: ['Auth'],
	responses: createApiResponse(z.null(), 'Success'),
});
router.get('/google/login/failure', authController.googleCallback);

authRegistry.registerPath({
	method: 'post',
	path: '/auth/refresh-token',
	tags: ['Auth'],
	responses: createApiResponse(loginResponseDtoSchema, 'Success'),
});
router.post(
	'/refresh-token',
	authMiddleware.verifyRefreshToken,
	authController.refreshToken,
);

authRegistry.registerPath({
	method: 'post',
	path: '/auth/send-otp',
	tags: ['Auth'],
	request: sendOtpRequestSchema,
	responses: createApiResponse(z.null(), 'Success'),
});
router.post(
	'/send-otp',
	validateRequestMiddleware(sendOtpRequestValidationSchema),
	authController.sendOtp,
);

authRegistry.registerPath({
	method: 'post',
	path: '/auth/send-otp',
	tags: ['Auth'],
	request: sendOtpRequestSchema,
	responses: createApiResponse(z.null(), 'Success'),
});
router.post(
	'/send-otp',
	validateRequestMiddleware(sendOtpRequestValidationSchema),
	authController.sendOtp,
);

authRegistry.registerPath({
	method: 'post',
	path: '/auth/verify',
	tags: ['Auth'],
	request: verifyRequestSchema,
	responses: createApiResponse(accountResponseDtoSchema, 'Success'),
});
router.post(
	'/verify',
	validateRequestMiddleware(verifyRequestValidationSchema),
	authController.verify,
);

authRegistry.registerPath({
	method: 'post',
	path: '/auth/forgot-password',
	tags: ['Auth'],
	request: forgotPasswordRequestSchema,
	responses: createApiResponse(accountResponseDtoSchema, 'Success'),
});
router.post(
	'/forgot-password',
	validateRequestMiddleware(forgotPasswordRequestValidationSchema),
	authController.forgotPassword,
);

authRegistry.registerPath({
	method: 'post',
	path: '/auth/logout',
	tags: ['Auth'],
	responses: createApiResponse(z.null(), 'Success'),
});
router.post('/logout', authMiddleware.verifyAccessToken, authController.logout);

authRegistry.registerPath({
	method: 'post',
	path: '/auth/clear-cookies',
	tags: ['Auth'],
	responses: createApiResponse(z.null(), 'Success'),
});
router.post('/clear-cookies', authController.clearCookies);

export const authRouter = router;
