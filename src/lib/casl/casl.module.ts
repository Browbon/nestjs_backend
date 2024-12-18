import { Global, Module } from '@nestjs/common';
import { CaslAbiltityFactory } from './casl-ability.factory';

@Global()
@Module({
  providers: [CaslAbiltityFactory],
  exports: [CaslAbiltityFactory],
})
export class NestCaslModule {}
