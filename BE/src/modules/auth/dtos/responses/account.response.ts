import { Prisma, UserStatusEnum } from '@prisma/client';
import z from 'zod';

export class AccountResponseDto {
	id: string;
	userId: string;
	email: string;
	name: string;
	avatar: string;
	verify: boolean;
	status: UserStatusEnum;

	constructor(account: Prisma.AccountGetPayload<{ include: { user: true } }>) {
		this.id = account.id;
		this.userId = account.userId;
		this.email = account.user?.email || '';
		this.name = account.user?.name || '';
		this.avatar = account.user?.avatar || '';
		this.verify = account.user?.verify || false;
		this.status = account.user?.status || UserStatusEnum.ACTIVE;
	}
}

export const accountResponseDtoSchema = z.object({
	id: z.uuid(),
	email: z.email(),
	name: z.string(),
	avatar: z.url(),
	verify: z.boolean(),
	status: z.nativeEnum(UserStatusEnum),
});
