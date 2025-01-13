import { databaseConfigValidationSchema } from './configs/database.config';
import * as process from 'node:process';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { HelperService } from 'common/helpers';
import {
  app,
  appConfigValidationSchema,
  database,
  facebookOauthConfigValidationSchema,
  googleOauthConfigValidationSchema,
  jwt,
  jwtConfigValidationSchema,
  rabbitmqConfigValidationSchema,
  redisConfigValidationSchema,
} from './configs';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`${process.cwd()}/.env.${process.env.NODE_ENV}`],
      load: [app, jwt, database],
      isGlobal: true,
      cache: true,
      expandVariables: true,
      validationSchema: Joi.object({
        ...appConfigValidationSchema,
        ...jwtConfigValidationSchema,
        ...databaseConfigValidationSchema,
        ...googleOauthConfigValidationSchema,
        ...facebookOauthConfigValidationSchema,
        ...rabbitmqConfigValidationSchema,
        ...redisConfigValidationSchema,
      }),
      validationOptions: {
        abortEarly: true,
        cache: !HelperService.isProd(),
        debug: !HelperService.isProd(),
        stack: !HelperService.isProd(),
      },
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class NestConfigModule {}
