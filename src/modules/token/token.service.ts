import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { BaseRepository } from 'common/databases';
import { RefreshToken, User } from 'entities';
import { RefreshTokenRepository } from './refresh-token.repository';
import { JwtService, JwtSignOptions, TokenExpiredError } from '@nestjs/jwt';
import {
  catchError,
  from,
  map,
  mergeMap,
  Observable,
  of,
  switchMap,
  throwError,
} from 'rxjs';
import { HelperService } from 'common/helpers';
import { JwtPayload } from 'common/@types/interfaces';
import { translate } from 'lib/i18n';

@Injectable()
export class TokenService {
  private readonly BASE_OPTIONS: JwtSignOptions = {
    issuer: 'nestify',
    audience: 'nestify',
  };

  constructor(
    @InjectRepository(User)
    private readonly userRepository: BaseRepository<User>,
    private readonly refreshTokenRepo: RefreshTokenRepository,
    private readonly jwt: JwtService,
  ) {}

  /**
   * Generate access token for given user
   * @param user - Omit<User, 'password'> object
   * @returns an Observable string of access token
   */
  generateAccessToken(user: Omit<User, 'password'>): Observable<string> {
    const options: JwtSignOptions = {
      ...this.BASE_OPTIONS,
      subject: String(user.id),
    };

    return from(
      this.jwt.signAsync(
        {
          ...HelperService.pick(user, ['roles', 'isTwoFactorEnabled']),
        },
        options,
      ),
    );
  }

  /**
   * Generate refresh token for the given user with the time to live number
   * @param user - Object that we generate token for
   * @param expiredIn - The number of seconds that the token will be valid for
   * @returns A string of refresh token
   */
  generateRefresToken(user: User, expiredIn: number): Observable<string> {
    return this.refreshTokenRepo.createRefreshToken(user, expiredIn).pipe(
      switchMap((token) => {
        const options: JwtSignOptions = {
          ...this.BASE_OPTIONS,
          expiresIn: expiredIn,
          subject: String(user.id),
          jwtid: String(token.id),
        };

        return from(this.jwt.signAsync({}, options));
      }),
    );
  }

  resolveRefreshToken(
    encoded: string,
  ): Observable<{ user: User; token: RefreshToken }> {
    return this.decodeRefreshToken(encoded).pipe(
      switchMap((payload) => {
        return this.getStoredTokenFromRefreshTokenPayload(payload).pipe(
          switchMap((token) => {
            if (!token) {
              throw new UnauthorizedException(
                translate('exception.refreshToken', {
                  args: { error: 'not found' },
                }),
              );
            }

            if (token.isRevoked) {
              return throwError(
                () =>
                  new UnauthorizedException(
                    translate('exception.refreshToken', {
                      args: { error: 'revoked' },
                    }),
                  ),
              );
            }

            return this.getUserFromRefreshTokenPayload(payload).pipe(
              mergeMap((user) => {
                if (user === null)
                  return throwError(
                    () =>
                      new UnauthorizedException(
                        translate('exception.refreshToken', {
                          args: { error: 'malformed' },
                        }),
                      ),
                  );

                return of({ user, token });
              }),
            );
          }),
        );
      }),
    );
  }

  /**
   * Decode the refresh token and throw error if the token is expired or malformed
   * @param token - The token need to be decoded
   * @returns The decoded jwt payload
   */
  decodeRefreshToken(token: string): Observable<JwtPayload> {
    return from(this.jwt.verifyAsync(token)).pipe(
      map((payload: JwtPayload) => payload),
      catchError((error) => {
        throw error instanceof TokenExpiredError
          ? new UnauthorizedException(
              translate('exception.refreshToken', {
                args: { error: 'expired' },
              }),
            )
          : new UnauthorizedException(
              translate('exception.refreshToken', {
                args: { error: 'malformed' },
              }),
            );
      }),
    );
  }

  getUserFromRefreshTokenPayload(payload: JwtPayload): Observable<User> {
    const subId = payload.sub;

    if (!subId) {
      return throwError(
        () =>
          new UnauthorizedException(
            translate('exception.refreshToken', {
              args: { error: 'malformed' },
            }),
          ),
      );
    }

    return from(this.userRepository.findOneOrFail({ id: subId }));
  }

  /**
   * It takes a refresh token from the payload, extracts the token id from it and then uses that token Id
   * to find corresponding refresh token in the database
   * @param payload - IJwtPayload
   * @returns Observable<RefreshToken | null>
   */
  getStoredTokenFromRefreshTokenPayload(
    payload: JwtPayload,
  ): Observable<RefreshToken | null> {
    const tokenId = payload.jti;

    if (tokenId == null) {
      return throwError(
        () =>
          new UnauthorizedException(
            translate('exception.refreshToken', {
              args: { error: 'malformed' },
            }),
          ),
      );
    }

    return this.refreshTokenRepo.findTokenById(tokenId);
  }

  deleteUserRefreshToken(user: User): Observable<User> {
    return this.refreshTokenRepo.deleteTokenForUser(user).pipe(
      map(() => {
        return user;
      }),
    );
  }

  deleteRefreshToken(user: User, payload: JwtPayload): Observable<User> {
    const tokenId = payload.jti;

    if (tokenId == null) {
      return throwError(
        () =>
          new UnauthorizedException(
            translate('exception.refreshToken', {
              args: { error: 'malformed' },
            }),
          ),
      );
    }
  }

  createAccessTokenFromRefreshToken(
    refresh: string,
  ): Observable<{ token: string; user: User }> {
    return this.resolveRefreshToken(refresh).pipe(
      switchMap(({ user }) => {
        return this.generateAccessToken(user).pipe(
          map((token) => {
            return { token, user };
          }),
        );
      }),
    );
  }
}
