import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigurableModuleClass } from './cloudinary.module-definition';
import { CloudinaryService } from './cloudinary.service';

// Read more at: https://docs.nestjs.com/fundamentals/dynamic-modules#configurable-module-builder
@Module({
  providers: [CloudinaryService],
  exports: [CloudinaryService],
})
export class NestCloudinaryModule
  extends ConfigurableModuleClass
  implements OnModuleInit
{
  constructor(private readonly serivce: CloudinaryService) {
    super();
  }

  async onModuleInit() {
    await this.serivce.pingCloudinary();
  }
}
