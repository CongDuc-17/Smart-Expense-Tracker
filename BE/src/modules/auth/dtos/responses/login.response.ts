import z from 'zod';

export class LoginResponseDto {
	accessToken: string;
	refreshToken: string;
}

export const loginResponseDtoSchema = z.object({
	accessToken: z.jwt(),
	refreshToken: z.jwt(),
});
