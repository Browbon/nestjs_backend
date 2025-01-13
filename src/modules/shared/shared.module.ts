import { OrmModule } from './../../lib/orm.module';
import { Module } from '@nestjs/common';
import { NestI18nModule } from 'lib/i18n';
import { NestConfigModule } from 'lib/config/config.module';
import { NestRabbitModule } from 'lib/rabbit.module';
import { NestHttpModule, NestJwtModule } from 'lib';
import { NestMailModule } from 'lib/mailer';
import { NestCaslModule } from 'lib/casl';
import { UserModule } from 'modules/user/user.module';
import { AuthModule } from 'modules/auth/auth.module';
import { ProfileModule } from 'modules/profile/profile.module';
import { PostModule } from 'modules/post/post.module';
import { NestCacheModule } from 'lib/cache';

@Module({
  imports: [
    NestConfigModule,
    NestMailModule,
    NestI18nModule,
    NestCaslModule,
    NestRabbitModule,
    NestCacheModule,
    NestHttpModule,
    NestJwtModule,
    OrmModule,
    AuthModule,
    UserModule,
    ProfileModule,
    PostModule,
  ],
  providers: [],
})
export class SharedModule {}
