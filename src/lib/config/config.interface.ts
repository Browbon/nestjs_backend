import { ConfigType } from '@nestjs/config';
import { app, jwt } from './configs';

export interface Config {
  app: ConfigType<typeof app>;
  jwt: ConfigType<typeof jwt>;
}
