import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { NoCache } from './nocache.decorator';
import { CacheKeyInterceptor } from 'common/interceptors';

export function ApplyCustomCache() {
  return applyDecorators(NoCache, UseInterceptors(CacheKeyInterceptor));
}
