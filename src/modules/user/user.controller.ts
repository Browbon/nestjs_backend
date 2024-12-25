import {
  ApiFile,
  GenericController,
  LoggedInUser,
  Public,
  SwaggerResponse,
  UUIDParam,
} from 'common/decorators';
import { UserService } from './user.service';
import {
  Body,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  UploadedFile,
} from '@nestjs/common';
import { EditUserDto, ReferUserDto, UserRegistrationDto } from './dtos';
import { ApiPaginatedResponse } from 'common/decorators/api-paginated.decorator';
import { User } from 'entities';
import { CursorPaginationDto } from 'common/dtos';
import { IFile, PaginationResponse } from 'common/@types/interfaces';
import { Observable } from 'rxjs';
import { fileValidatorPipe } from 'common/misc';
import { Action, Role } from 'common/@types/enums';
import { CheckPolicies } from 'lib/casl/policy.decorator';
import { GenericPolicyHandler } from 'lib/casl';

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

  @Public()
  @Post('register')
  @SwaggerResponse({
    operation: 'Create user',
    badRequest: 'User already registered with email.',
  })
  @ApiFile({ fieldName: 'avatar', required: true }) // fix this
  publicRegistration(
    @Body() dto: UserRegistrationDto,
    @UploadedFile(fileValidatorPipe({}))
    image: IFile,
  ): Observable<User> {
    return this.userService.create({
      ...dto,
      roles: [Role.AUTHOR],
      files: image,
    });
  }

  @Patch(':idx')
  @SwaggerResponse({
    operation: 'User edit',
    badRequest: 'User already registered with email.',
    notFound: 'User does not exist.',
    params: ['idx'],
  })
  @CheckPolicies(new GenericPolicyHandler(User, Action.UPDATE))
  update(
    @UUIDParam('idx') index: string,
    @Body()
    dto: EditUserDto,
    @UploadedFile(fileValidatorPipe({ required: false }))
    image?: IFile,
  ): Observable<User> {
    return this.userService.update(index, dto, image);
  }

  @Delete(':idx')
  @SwaggerResponse({
    operation: 'User delete',
    notFound: 'User does not exist.',
    params: ['idx'],
  })
  @CheckPolicies(new GenericPolicyHandler(User, Action.DELETE))
  remove(@UUIDParam('idx') index: string): Observable<User> {
    return this.userService.remove(index);
  }
}
