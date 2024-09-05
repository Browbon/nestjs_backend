import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';
import { AuthService } from './auth.service';

@Module({
  imports: [PassportModule, UserModule],
  controllers: [],
  providers: [AuthService],
})
export class AuthModule {}
