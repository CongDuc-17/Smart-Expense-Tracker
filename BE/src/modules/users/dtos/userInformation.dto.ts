import { UserStatusEnum } from '@prisma/client';

import { users } from '@/models';

export class UserInformationDto {
	id: string;
	email: string;
	name: string;
	bio?: string;
	address?: string;
	avatar?: string;
	verify: boolean;
	status: UserStatusEnum;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date | null;

	constructor(user: users) {
		this.id = user.id;
		this.email = user.email;
		this.name = user.name;
		this.bio = user.bio ?? undefined;
		this.address = user.address ?? undefined;
		this.avatar = user.avatar ?? undefined;
		this.verify = user.verify;
		this.status = user.status;
		this.createdAt = user.createdAt;
		this.updatedAt = user.updatedAt;
		this.deletedAt = user.deletedAt ?? null;
	}
}
