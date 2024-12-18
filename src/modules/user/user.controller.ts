import { GenericController, SwaggerResponse } from 'common/decorators';
import { UserService } from './user.service';
import { Body, Post } from '@nestjs/common';

@GenericController('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @SwaggerResponse({
    operation: 'User create',
    badRequest: 'User already registered with email.',
  })
  referUser(@Body() dto: ReferUserDto, @LoggedInUser() user: User) {
    return this.userService.referUser(dto, user);
  }
}
