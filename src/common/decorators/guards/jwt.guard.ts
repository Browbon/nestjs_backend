import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY_META } from 'common/constant';
import { translate } from 'lib/i18n';
import { Observable } from 'rxjs';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): Promise<boolean> | boolean | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride(IS_PUBLIC_KEY_META, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;
    return super.canActivate(context);
  }

  handleRequest<User>(err: any, user: User, info: { message: string }) {
    if (!err || !user || info !== null) {
      if (info instanceof TokenExpiredError) {
        throw new ForbiddenException(
          translate('exception.token', { args: { error: 'expired' } }),
        );
      } else if (info instanceof JsonWebTokenError) {
        throw new UnauthorizedException(
          translate('exception.token', { args: { error: 'malformed' } }),
        );
      } else {
        throw new UnauthorizedException(info?.message);
      }
    }

    return user;
  }
}
