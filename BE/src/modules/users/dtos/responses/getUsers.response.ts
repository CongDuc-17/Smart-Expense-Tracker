import { User, UserStatusEnum } from '@prisma/client';
import z from 'zod';

export class GetUsersResponseDto {
	id: string;
	email: string;
	name: string;
	avatar: string | null | undefined;
	updatedAt: Date | null | undefined;
	deletedAt: Date | null | undefined;
	status: UserStatusEnum;

	constructor(userInformation: User) {
		this.id = userInformation.id;
		this.email = userInformation.email;
		this.name = userInformation.name;
		this.avatar = userInformation.avatar;
		this.updatedAt = userInformation.updatedAt;
		this.deletedAt = userInformation.deletedAt;
		this.status = userInformation.status;
	}
}

export const getUsersResponseDtoSchema = z.object({
	id: z.uuid(),
	email: z.email(),
	name: z.string(),
	avatar: z.string().nullable(),
	updatedAt: z.date(),
	deletedAt: z.date().nullable(),
	status: z.nativeEnum(UserStatusEnum),
});
