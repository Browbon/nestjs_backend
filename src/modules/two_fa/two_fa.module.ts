import { Module } from '@nestjs/common';
import { AuthModule } from 'modules/auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [],
  exports: [],
})
export class TwoFactorModule {}
