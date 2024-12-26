import {
  ApplyCustomCache,
  GenericController,
  LoggedInUser,
  SwaggerResponse,
} from 'common/decorators';
import { ProfileService } from './profile.service';
import { Delete, Get, Param, Post } from '@nestjs/common';
import { User } from 'entities';
import { Observable } from 'rxjs';
import { ProfileData } from 'common/@types/interfaces';

@GenericController('profile', true)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @ApplyCustomCache()
  @Get()
  @SwaggerResponse({
    operation: 'Profile fetch',
    notFound: 'Profile does not exist.',
  })
  profile(@LoggedInUser('username') username: string): Observable<User> {
    return this.profileService.getProfileByUsername(username, [
      'followers',
      'followed',
    ]);
  }

  @Post(':username/follow')
  @SwaggerResponse({
    operation: 'Profile follow',
    notFound: 'Profile does not exist.',
    params: ['username'],
  })
  follow(
    @LoggedInUser() user: User,
    @Param('username')
    username: string,
  ): Observable<ProfileData> {
    return this.profileService.follow(user, username);
  }

  @Delete(':username/unfollow')
  @SwaggerResponse({
    operation: 'Profile unfollow',
    notFound: 'Profile does not exist.',
    params: ['username'],
  })
  unFollow(
    @LoggedInUser() user: User,
    @Param('username')
    username: string,
  ): Observable<ProfileData> {
    return this.profileService.unFollow(user, username);
  }
}
