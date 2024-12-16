import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { NestifyRequest } from 'common/@types/typings/global';
import { User } from 'entities';

export const LoggedInUser = createParamDecorator(
  (data: keyof User, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<NestifyRequest>();

    const user = request.user as User;

    return data ? user[data] : user;
  },
);
