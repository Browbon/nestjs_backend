import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { RefreshTokenRepository, TokenService } from 'modules/token';
import { GoogleStrategy, JwtStrategy } from './strategies';

@Module({
  imports: [PassportModule, UserModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    JwtStrategy,
    RefreshTokenRepository,
    GoogleStrategy,
  ],
})
export class AuthModule {}
