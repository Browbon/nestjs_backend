import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppAbility, CaslAbiltityFactory } from './casl-ability.factory';
import { CHECK_POLICY_META_KEY, IS_PUBLIC_KEY_META } from 'common/constant';
import { PolicyHandler } from './policy.interface';
import { User } from 'entities';
import { Request } from 'express';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbiltityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>(
      IS_PUBLIC_KEY_META,
      context.getHandler(),
    );

    // allow request if route marked as public
    if (isPublic) return true;

    const policyHandlers =
      this.reflector.get<PolicyHandler[]>(
        CHECK_POLICY_META_KEY,
        context.getHandler(),
      ) ?? [];

    const request = context.switchToHttp().getRequest<Request>();
    const { user } = request;

    const userAbility = this.caslAbilityFactory.createForUser(user as User);

    return policyHandlers.every((handler) =>
      this.execPolicyHandler(handler, request, userAbility),
    );
  }

  private execPolicyHandler(
    handler: PolicyHandler,
    request: Request,
    ability: AppAbility,
  ) {
    if (typeof handler === 'function') {
      return handler(request, ability);
    }

    return handler.handle(request, ability);
  }
}
