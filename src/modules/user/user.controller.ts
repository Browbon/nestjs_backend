import {
  GenericController,
  LoggedInUser,
  Public,
  SwaggerResponse,
} from 'common/decorators';
import { UserService } from './user.service';
import { Body, Get, Post, Query } from '@nestjs/common';
import { ReferUserDto } from './dtos';
import { ApiPaginatedResponse } from 'common/decorators/validation/api-paginated.decorator';
import { User } from 'entities';
import { CursorPaginationDto } from 'common/dtos';
import { PaginationResponse } from 'common/@types/interfaces';
import { Observable } from 'rxjs';

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

  @Public()
  @ApiPaginatedResponse(User)
  @Get()
  findAll(
    @Query() PaginationDto: CursorPaginationDto,
  ): Observable<PaginationResponse<User>> {
    return this.userService.findAll(PaginationDto);
  }
}
