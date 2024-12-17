import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { baseOptions } from 'common/databases';
import * as Entities from '../entities';
import { Configs } from 'common/@types/typings/global';

@Global()
@Module({
  imports: [
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<Configs, true>) => ({
        ...baseOptions,
        ...config.getOrThrow('database', { infer: true }),
      }),
    }),
    MikroOrmModule.forFeature({
      entities: Object.values(Entities),
    }),
  ],
  exports: [MikroOrmModule],
})
export class OrmModule {}
