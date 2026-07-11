import { Exception } from '@tsed/exceptions';
import { UserStatusEnum } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import passport from 'passport';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';

import { UsersRepository } from '@/modules/users/users.repository';

import { AuthRepository } from '../auth.repository';

import { InternalServerException, OptionalException } from '@/common';
import { GoogleOauthConfig } from '@/configs';
import { SocialAccountWithPartialRelations } from '@/models';

export class GoogleOauthStrategy {
	constructor(
		private readonly authRepository = new AuthRepository(),
		private readonly usersRepository = new UsersRepository(),
	) {
		this.authRepository = authRepository;

		passport.use(
			'google',
			new Strategy(
				{
					clientID: GoogleOauthConfig.clientId,
					clientSecret: GoogleOauthConfig.clientSecret,
					callbackURL: GoogleOauthConfig.redirectUri,
					scope: ['email', 'profile'],
				},
				this.validate.bind(this),
			),
		);
	}

	async validate(
		accessToken: string,
		refreshToken: string,
		profile: Profile,
		done: VerifyCallback,
	): Promise<void> {
		try {
			const user = {
				googleId: profile.id,
				email: profile.emails?.[0]?.value || '',
				name: profile.displayName || (profile.name ? `${profile.name.givenName || ''} ${profile.name.familyName || ''}`.trim() : '') || profile.emails?.[0]?.value?.split('@')[0] || 'Google User',
				avatar: profile.photos?.[0]?.value,
				verified: profile.emails?.[0]?.verified || false,
			};

			let existingUser = await this.usersRepository.findUser({
				email: user.email,
			});

			let socialAccount: SocialAccountWithPartialRelations | null;

			if (!existingUser) {
				socialAccount = await this.authRepository.createSocialAccount({
					socialAccount: {
						googleId: user.googleId,
						googleAccessToken: accessToken,
						googleRefreshToken: refreshToken,
						user: {
							create: {
								email: user.email,
								name: user.name,
								avatar: user.avatar,
								verify: true,
							},
						},
					},
				});
			} else {
				if (existingUser.status === UserStatusEnum.LOCKED) {
					return done(null, false as any, { message: 'Account is locked' });
				}

				socialAccount = await this.authRepository.findSocialAccount({
					email: user.email,
				});

				if (!socialAccount) {
					socialAccount = await this.authRepository.createSocialAccount({
						socialAccount: {
							googleId: user.googleId,
							googleAccessToken: accessToken,
							googleRefreshToken: refreshToken,
							user: {
								connect: {
									id: existingUser.id,
								},
							},
						},
					});
				}
			}

			done(null, {
				socialAccountInformation: socialAccount,
			});
		} catch (error) {
			console.error("Google OAuth validate error:", error);
			return done(error as Error, false as any);
		}
	}
}
