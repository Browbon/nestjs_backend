import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Configs, NestifyResponse } from 'common/@types/typings/global';
import { BaseRepository } from 'common/databases';
import { User } from 'entities';
import { authenticator } from 'otplib';
import { from, map, Observable, throwError } from 'rxjs';
import { toFileStream } from 'qrcode';
import { translate } from 'lib/i18n';

interface GeneratedTwoFactorResponse {
  secret: string;
  otpAuthUrl: string;
}

@Injectable()
export class TwoFactorService {
  constructor(
    @InjectRepository('User')
    private readonly userRepository: BaseRepository<User>,
    private readonly configService: ConfigService<Configs, true>,
    private readonly em: EntityManager,
  ) {}

  /**
   * It generates a secret, creates a Otp Auth Url, assgins the secret to the user
   * and flushes the user repository
   * @param user - User - The user object that we want to generate secret for
   * @returns An observable that returns an object with secret and otpAuthUrl
   */
  generateTwoFactorSecret(user: User): Observable<GeneratedTwoFactorResponse> {
    const secret = authenticator.generateSecret();

    const otpAuthUrl = authenticator.keyuri(
      user.email,
      this.configService.get('app.name', { infer: true }),
      secret,
    );

    this.userRepository.assign(user, { twoFactorSecret: secret });

    return from(this.em.flush()).pipe(
      map(() => {
        return { secret, otpAuthUrl };
      }),
    );
  }

  /**
   * Take response stream and OTP Auth Url as parameter and return the observble that emits
   * the file path of QR code image (support PNG)
   * @param stream - Response stream
   * @param otpAuthUrl - The OTP Auth Url that you want to generate QR code for
   * @returns Observable<unknown>
   */
  pipeQrCodeStream(
    stream: NestifyResponse,
    otpAuthUrl: string,
  ): Observable<unknown> {
    return from(toFileStream(stream, otpAuthUrl));
  }

  /**
   * Return true if the two factor authentication code is valid for user, otherwise false
   * @param twoFactorAuthenticationCode - The code that user entered in the form
   * @param user - The user that need to be checked with the two factor authetication code
   * @returns - Boolean
   */
  isTwoFactorCodeValid(
    twoFactorAuthenticationCode: string,
    user: User,
  ): boolean {
    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: user.twoFactorSecret!,
    });
  }

  /**
   * Take two factor authentication code and user as parameter, check if the code is valid
   * and if it is, we enables two factor authentication feature for that user
   * @param twoFactorAuthenticationCode - The code need to be checked
   * @param user - The user that we need to turn on two factor authentication for
   * @returns Observable<User>
   */
  turnOnTwoFactorAuthentication(
    twoFactorAuthenticationCode: string,
    user: User,
  ): Observable<User> {
    const isCodeValid = this.isTwoFactorCodeValid(
      twoFactorAuthenticationCode,
      user,
    );

    if (!isCodeValid) {
      return throwError(() =>
        translate('exception.refreshToken', {
          args: { error: 'malformed' },
        }),
      );
    }

    this.userRepository.assign(user, { isTwoFactorEnabled: true });

    return from(this.em.flush()).pipe(map(() => user));
  }
}
