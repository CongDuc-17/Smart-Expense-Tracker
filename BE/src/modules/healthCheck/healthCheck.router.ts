import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Router } from 'express';
import z from 'zod';

import { HealthCheckController } from './healthCheck.controller';

import { autoBindUtil } from '@/common';
import { createApiResponse } from '@/swagger/openAPIResponseBuilders';

export const healthCheckRegistry = new OpenAPIRegistry();

const router = express.Router({ mergeParams: true });

const healthCheckController = new HealthCheckController();
autoBindUtil(healthCheckController);

healthCheckRegistry.registerPath({
	method: 'get',
	path: '/health-check',
	tags: ['Health Check'],
	responses: createApiResponse(z.null(), 'Success'),
});
router.get('/', healthCheckController.start);

export const healthCheckRouter: Router = router;
