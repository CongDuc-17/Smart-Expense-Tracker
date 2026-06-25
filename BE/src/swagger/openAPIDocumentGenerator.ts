import { OpenApiGeneratorV3, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

import { Registries } from '../modules';

import {
	SWAGGER_API_DESCRIPTION,
	SWAGGER_API_PATH,
	SWAGGER_API_TITLE,
	SWAGGER_API_VERSION,
} from './constants';

type GeneratedOpenAPIDocument = ReturnType<OpenApiGeneratorV3['generateDocument']>;

export function generateOpenAPIDocument(): GeneratedOpenAPIDocument {
	const registry = new OpenAPIRegistry([...Registries]);

	registry.registerComponent('securitySchemes', 'bearerAuth', {
		type: 'http',
		scheme: 'bearer',
		bearerFormat: 'JWT',
		name: 'Authorization',
		in: 'header',
	});

	const generator = new OpenApiGeneratorV3(registry.definitions);

	return generator.generateDocument({
		openapi: '3.0.0',
		info: {
			version: SWAGGER_API_VERSION,
			title: SWAGGER_API_TITLE,
		},
		externalDocs: {
			description: SWAGGER_API_DESCRIPTION,
			url: SWAGGER_API_PATH,
		},
	});
}
