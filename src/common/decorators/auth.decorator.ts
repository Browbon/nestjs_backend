import { applyDecorators, CanActivate, Type, UseGuards } from '@nestjs/common';
import { API_UNAUTHORIZED_RESPONSE } from '../constant';
import { JwtGuard } from './guards';

interface AuthOptions {
  guards?: Type<CanActivate>[];
  unauthorizedResponse?: string;
}

export function Auth(options_?: AuthOptions) {
  const options = {
    guards: [JwtGuard],
    unauthorizedResponse: API_UNAUTHORIZED_RESPONSE,
    ...options_,
  } satisfies AuthOptions;

  return applyDecorators(UseGuards(...options.guards));
}
