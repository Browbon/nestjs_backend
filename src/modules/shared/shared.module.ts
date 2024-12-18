import { OrmModule } from './../../lib/orm.module';
import { Module } from '@nestjs/common';
import { NestI18nModule } from 'lib/i18n';
import { NestConfigModule } from 'lib/config/config.module';
import { NestRabbitModule } from 'lib/rabbit.module';
import { NestHttpModule, NestJwtModule } from 'lib';
import { NestMailModule } from 'lib/mailer';
import { NestCaslModule } from 'lib/casl';
import { UserModule } from 'modules/user/user.module';

@Module({
  imports: [
    NestConfigModule,
    NestMailModule,
    NestI18nModule,
    NestCaslModule,
    NestRabbitModule,
    NestHttpModule,
    NestJwtModule,
    OrmModule,
    UserModule,
  ],
  providers: [],
})
export class SharedModule {}
