import { RoleEnum, UserStatusEnum } from '@prisma/client';
import z from 'zod';

import { User } from '@/models';
import { UserInformationDto } from '../userInformation.dto';

export class GetUserResponseDto {
	id: string;
	email: string;
	name: string;
	avatar: string | null | undefined;
	createdAt: Date | null | undefined;
	updatedAt: Date | null | undefined;
	deletedAt: Date | null | undefined;
	status: UserStatusEnum;
	role: RoleEnum

	constructor(userInformation: User | UserInformationDto) {
		this.id = userInformation.id;
		this.email = userInformation.email;
		this.name = userInformation.name;
		this.avatar = userInformation.avatar;
		this.createdAt = userInformation.createdAt;
		this.updatedAt = userInformation.updatedAt;
		this.deletedAt = userInformation.deletedAt;
		this.status = userInformation.status;
		this.role = userInformation.role;
	}
}

export const getUserResponseDtoSchema = z.object({
	id: z.uuid(),
	email: z.email(),
	name: z.string(),
	avatar: z.string().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
	deletedAt: z.date().nullable(),
	status: z.nativeEnum(UserStatusEnum),
	role: z.nativeEnum(RoleEnum),
});
