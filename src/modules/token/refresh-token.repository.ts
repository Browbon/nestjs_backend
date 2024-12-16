import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'common/databases';
import { RefreshToken, User } from 'entities';
import { from, map, Observable } from 'rxjs';

@Injectable()
export class RefreshTokenRepository {
  constructor(
    private readonly em: EntityManager<PostgreSqlDriver>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: BaseRepository<RefreshToken>,
  ) {}

  /**
   * Create a refresh token for the provided user and expiration time
   * @param user - the user that token is being created for
   * @param ttl - time to live of token in seconds
   * @returns a refresh token
   */
  createRefreshToken(user: User, ttl: number): Observable<RefreshToken> {
    const expiration = new Date();

    // the input is trested as milisecond so *1000 is necessary
    const ttlSeconds = ttl * 1000; // seconds

    expiration.setTime(expiration.getTime() + ttlSeconds);

    const token = this.refreshTokenRepository.create({
      user: user.id,
      expiredIn: expiration,
    });

    return from(this.em.persistAndFlush(token)).pipe(map(() => token));
  }

  /**
   * Find the refresh token with the given id
   * @param id - the id of token needed to be founded
   * @returns Observable of RefreshToken
   */
  findTokenById(id: number): Observable<RefreshToken> {
    return from(
      this.refreshTokenRepository.findOneOrFail({
        id,
        isRevoked: false,
      }),
    );
  }

  /**
   * Delete all the refresh token for given user
   * @param user - The user object that we want to delete refresh token for
   * @returns A boolean value
   */
  deleteTokenForUser(user: User): Observable<boolean> {
    return from(
      this.refreshTokenRepository.nativeUpdate({ user }, { isRevoked: true }),
    ).pipe(map(() => true));
  }

  /**
   * Delete refresh tokens by setting its 'isRevoked' property to 'true'
   * @param user - User - the user object that is currently logged in
   * @param tokenId - The ID of the token to be deleted.
   * @returns A boolean value.
   */
  deleteToken(user: User, tokenId: number): Observable<boolean> {
    return from(
      this.refreshTokenRepository.nativeUpdate(
        { user, id: tokenId },
        { isRevoked: true },
      ),
    ).pipe(map(() => true));
  }
}
