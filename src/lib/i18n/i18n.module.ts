import * as path from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import { HelperService } from '../../common/helpers';

@Module({
  imports: [
    I18nModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async () => ({
        fallbackLanguage: 'en',
        fallbacks: {
          'en-*': 'en',
          'vi-*': 'vi',
          vi: 'vi',
        },
        logging: true,
        loaderOptions: {
          path: path.join(__dirname, '../../resources/i18n/'),
          watch: true,
          includeSubfolders: true,
        },
        typesOutputPath: HelperService.isProd()
          ? undefined
          : path.join(`${process.cwd()}/src/generated/i18n-generated.ts`),
      }),
      resolvers: [
        { use: QueryResolver, options: ['lang'] }, // Query parameter ?lang=
        AcceptLanguageResolver, // Using Accept-Language header
        new HeaderResolver(['x-lang']), // Allows setting language via custom header
      ],
    }),
  ],
  exports: [I18nModule],
})
export class NestI18nModule {}
