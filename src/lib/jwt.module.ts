import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Config } from './config/config.interface';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<Config, true>) => ({
        global: true,
        secret: configService.get('jwt.secret', { infer: true }),
        signOptions: {
          expiresIn: configService.get('jwt.accessExpiry', { infer: true }),
          algorithm: configService.get('jwt.algorithm', { infer: true }),
        },
      }),
    }),
  ],
  exports: [JwtModule],
})
export class NestJwtModule {}
