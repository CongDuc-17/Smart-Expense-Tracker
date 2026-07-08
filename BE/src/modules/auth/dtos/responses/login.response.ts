import { RoleEnum } from '@prisma/client';
import z from 'zod';

export class LoginResponseDto {
	accessToken: string;
	refreshToken: string;
	role?: RoleEnum;
}

export const loginResponseDtoSchema = z.object({
	accessToken: z.string(),
	refreshToken: z.string(),
	role: z.nativeEnum(RoleEnum).optional(),
});
