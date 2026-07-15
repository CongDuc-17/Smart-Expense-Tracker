import { RoleEnum, UserStatusEnum } from '@prisma/client';

import { User } from '@/models';

export class UserInformationDto {
	id: string;
	email: string;
	name: string;
	avatar: string | null;
	avatarPublicId: string | null;
	verify: boolean;
	role: RoleEnum
	status: UserStatusEnum;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date | null;

	constructor(user: User) {
		this.id = user.id;
		this.email = user.email;
		this.name = user.name;
		this.avatar = user.avatar ?? null;
		this.avatarPublicId = user.avatarPublicId ?? null;
		this.verify = user.verify;
		this.role = user.role;
		this.status = user.status;
		this.createdAt = user.createdAt;
		this.updatedAt = user.updatedAt;
		this.deletedAt = user.deletedAt ?? null;
	}
}
