import { OrmModule } from './../../lib/orm.module';
import { Module } from '@nestjs/common';
import { NestI18nModule } from 'lib/i18n';
import { NestConfigModule } from 'lib/config/config.module';

@Module({
  imports: [NestConfigModule, OrmModule, NestI18nModule],
})
export class SharedModule {}
