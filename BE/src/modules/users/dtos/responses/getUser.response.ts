import { UserStatusEnum } from '@prisma/client';
import z from 'zod';

import { UserInformationDto } from '../userInformation.dto';

import { User } from '@/models';

export class GetUserResponseDto {
	id: string;
	email: string;
	name: string;
	avatar: string | null | undefined;
	createdAt: Date | null | undefined;
	updatedAt: Date | null | undefined;
	deletedAt: Date | null | undefined;
	status: UserStatusEnum;

	constructor(userInformation: User | UserInformationDto) {
		this.id = userInformation.id;
		this.email = userInformation.email;
		this.name = userInformation.name;
		this.avatar = userInformation.avatar;
		this.createdAt = userInformation.createdAt;
		this.updatedAt = userInformation.updatedAt;
		this.deletedAt = userInformation.deletedAt;
		this.status = userInformation.status;
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
});
