import { Module } from '@nestjs/common';
import { AuthModule } from 'modules/auth/auth.module';
import { TwoFactorController } from './two_fa.controller';
import { TwoFactorService } from './two_fa.service';
import { JwtTwoFactorStrategy } from 'modules/auth/strategies';

@Module({
  imports: [AuthModule],
  controllers: [TwoFactorController],
  providers: [TwoFactorService, JwtTwoFactorStrategy],
})
export class TwoFactorModule {}
