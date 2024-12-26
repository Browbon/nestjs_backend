import { InjectRepository } from '@mikro-orm/nestjs';
import {
  AutoPath,
  EntityKey,
  EntityManager,
  PostgreSqlDriver,
} from '@mikro-orm/postgresql';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProfileData } from 'common/@types/interfaces';
import { BaseRepository } from 'common/databases';
import { User } from 'entities';
import { itemDoesNotExistKey, translate } from 'lib/i18n';
import {
  from,
  map,
  mergeMap,
  Observable,
  of,
  switchMap,
  throwError,
} from 'rxjs';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private userRepository: BaseRepository<User>,
    private readonly em: EntityManager<PostgreSqlDriver>,
  ) {}

  /**
   * Get a user by their username and populate with listed fields
   * @param username - String
   * @param populate - AutoPath<User, EntityKey<User>>[]
   * @returns Observable<User>
   */
  getProfileByUsername(
    username: string,
    populate: AutoPath<User, EntityKey<User>>[] = [], // use AutoPath ensures type safety and correctness
  ): Observable<User> {
    return from(
      this.userRepository.findOne(
        {
          username,
        },
        {
          populate,
          populateWhere: {
            favorites: { isActive: true, isDeleted: false },
            followers: { isActive: true, isDeleted: false },
            followed: { isActive: true, isDeleted: false },
            posts: { isActive: true, isDeleted: false },
          },
        },
      ),
    ).pipe(
      mergeMap((user) => {
        if (!user) {
          return throwError(
            () =>
              new NotFoundException(
                translate(itemDoesNotExistKey, {
                  args: { item: 'Profile' },
                }),
              ),
          );
        }

        return of(user);
      }),
    );
  }

  /**
   * Follows an user with provided username
   * @param loggedInUser - User
   * @param usernameToFollow - String
   * @returns Observable<ProfileData>
   */
  follow(
    loggedInUser: User,
    usernameToFollow: string,
  ): Observable<ProfileData> {
    if (!usernameToFollow) {
      return throwError(
        () => new BadRequestException(translate('exception.usernameRequired')),
      );
    }

    return this.getProfileByUsername(usernameToFollow, ['followers']).pipe(
      switchMap((followingUser) => {
        if (loggedInUser.username === usernameToFollow) {
          return throwError(
            () =>
              new BadRequestException(
                translate('exception.followerFollowingSame'),
              ),
          );
        }

        followingUser.followers.add(loggedInUser);

        const profile: ProfileData = {
          following: true,
          avatar: followingUser.avatar,
          username: followingUser.username,
        };

        return from(this.em.flush()).pipe(map(() => profile));
      }),
    );
  }

  /**
   * Unfollows an user with provided username
   * @param loggedInUser - User
   * @param username - String
   * @returns Observable<ProfileData>
   */
  unFollow(loggedInUser: User, username: string): Observable<ProfileData> {
    if (!username) {
      return throwError(
        () => new BadRequestException(translate('exception.usernameRequired')),
      );
    }

    return this.getProfileByUsername(username, ['followers']).pipe(
      switchMap((followingUser) => {
        const followerUser = this.userRepository.getReference(loggedInUser.id);

        if (followingUser.id === loggedInUser.id) {
          return throwError(
            () =>
              new BadRequestException(
                translate('exception.followerFollowingSame'),
              ),
          );
        }

        followingUser.followers.remove(followerUser);

        const profile: ProfileData = {
          following: false,
          avatar: followingUser.avatar,
          username: followingUser.username,
        };

        return from(this.em.flush()).pipe(map(() => profile));
      }),
    );
  }
}
