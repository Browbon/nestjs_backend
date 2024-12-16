import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { randAnimal, randCatchPhrase, randFirstName } from '@ngneat/falso';
import { OauthResponse } from 'common/@types/interfaces';
import { Configs } from 'common/@types/typings/global';
import { BaseRepository } from 'common/databases';
import { HelperService } from 'common/helpers';
import { User } from 'entities';
import { Profile, VerifyCallback } from 'passport-google-oauth20';
import { Strategy } from 'passport-jwt';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  /**
   * It's a PassportStrategy that uses the GoogleStrategy and the Google OAuth2.0 API to authenticate users
   * Create a new project at
   * https://console.cloud.google.com/apis/
   *
   * The callback url should match whats specified in the callbackURL section
   *
   *
   */

  constructor(
    @InjectRepository(User)
    private readonly userRepo: BaseRepository<User>,
    public readonly configService: ConfigService<Configs, true>,
  ) {
    super({
      clientID: configService.get('googleAuth.clientId', { infer: true }),
      clientSecret: configService.get('googleAuth.secret', { infer: true }),
      callbackURL: configService.get('googleAuth.callbackUrl', {
        infer: true,
      }),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos, username } = profile;
    const user: OauthResponse = {
      email: emails![0]!.value,
      firstName: name?.givenName ?? randFirstName(),
      lastName: name?.familyName ?? randAnimal(),
      accessToken,
    };

    // Check if the user already exists in your database
    const existingUser = await this.userRepo.findOne({
      email: emails![0]!.value,
      isDeleted: false,
    });

    if (existingUser) {
      // If the user exists, return the user object
      done(undefined, existingUser);
    } else {
      // If the user doesn't exist, create a new user
      const newUser = this.userRepo.create({
        ...HelperService.omit(user, ['accessToken']),
        avatar: photos?.[0]?.value ?? HelperService.randomAvatar(),
        username: username ?? emails![0]!.value,
        bio: randCatchPhrase(),
        password: HelperService.randomString({
          length: 10,
          symbols: true,
          numbers: true,
        }),
      });

      done(undefined, newUser);
    }
  }
}
