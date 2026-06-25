// import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
// // const { PrismaClient } = require('@prisma/client');
// import { PrismaClient } from '@prisma/client';
// // const PrismaService = new PrismaClient();

// export { PrismaClient, PrismaClientKnownRequestError };

import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

import { PrismaService } from './prisma.service';

// import { createSystemChatBoxSpoke } from "./seeds";

export {
	PrismaService,
	Prisma,
	PrismaClientKnownRequestError,
	// createSystemChatBoxSpoke,
};
