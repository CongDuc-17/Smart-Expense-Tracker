import { Prisma } from '@prisma/client';

export class CheckLoginWithGoogleOauthRequestDto {
	socialAccountInformation: Prisma.SocialAccountGetPayload<{ include: { user: true } }>;
}
