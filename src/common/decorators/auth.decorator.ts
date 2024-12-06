import { applyDecorators, CanActivate, Type, UseGuards } from '@nestjs/common';
import { API_UNAUTHORIZED_RESPONSE } from '../constant';
import { JwtGuard } from './guards';
import { PoliciesGuard } from 'lib/casl';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

interface AuthOptions {
  guards?: Type<CanActivate>[];
  unauthorizedResponse?: string;
}

export function Auth(options_?: AuthOptions) {
  const options = {
    guards: [JwtGuard, PoliciesGuard],
    unauthorizedResponse: API_UNAUTHORIZED_RESPONSE,
    ...options_,
  } satisfies AuthOptions;

  return applyDecorators(
    UseGuards(...options.guards),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: options.unauthorizedResponse }),
  );
}
