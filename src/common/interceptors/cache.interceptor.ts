import { CACHE_KEY_METADATA, CacheInterceptor } from '@nestjs/cache-manager';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { NestifyRequest } from 'common/@types/typings/global';
import { IGNORE_CACHING_META } from 'common/constant';
import { User } from 'entities';

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  protected isRequestCacheable(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<NestifyRequest>();

    const ignoreCaching: boolean = this.reflector.get(
      IGNORE_CACHING_META,
      context.getHandler(),
    );

    return !ignoreCaching && request.method === 'GET';
  }
}

@Injectable()
export class CacheKeyInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    // extract http to confirm that not using websocket or CLI,..
    const httpAdapter = this.httpAdapterHost.httpAdapter;
    const isHttpApp =
      httpAdapter != null && httpAdapter.getRequestMethod != null;

    const cacheMetadata = this.reflector.get<string>(
      CACHE_KEY_METADATA,
      context.getHandler(),
    );

    const request = context.getArgByIndex<NestifyRequest>(0);
    const user: User = request.user as User;

    if (!isHttpApp || cacheMetadata) return `${cacheMetadata}_${user.idx}`;

    if (!this.isRequestCacheable(context)) return undefined;

    return `${httpAdapter.getRequestUrl(request)}_${user.idx}`;
  }
}
