import { Prisma, PrismaClient } from '@prisma/client';

export class PrismaService extends PrismaClient<
	Prisma.PrismaClientOptions,
	'query' | 'beforeExit'
> {
	constructor() {
		super();
	}
}
