import { ConfigurableModuleBuilder } from '@nestjs/common';
import { CloudinaryModuleOptions } from './cloudinary.options';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<CloudinaryModuleOptions>({
    moduleName: 'NestCloudinaryModule',
  })
    .setClassMethodName('forRoot')
    .setExtras(
      {
        isGlobal: true,
      },
      (definition, extras) => ({
        ...definition,
        global: extras.isGlobal,
      }),
    )
    .build();
