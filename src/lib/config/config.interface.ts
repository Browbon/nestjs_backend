import { ConfigType } from '@nestjs/config';
import { app, database, jwt } from './configs';

export interface Configs {
  app: ConfigType<typeof app>;
  jwt: ConfigType<typeof jwt>;
  database: ConfigType<typeof database>;
}
