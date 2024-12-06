import { SetMetadata } from '@nestjs/common';
import { PolicyHandler } from './policy.interface';
import { CHECK_POLICY_META_KEY } from 'common/constant';

export function CheckPolicies(...handlers: PolicyHandler[]) {
  return SetMetadata(CHECK_POLICY_META_KEY, handlers);
}
