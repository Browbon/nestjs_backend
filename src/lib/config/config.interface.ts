import { ConfigType } from '@nestjs/config';
import { app, database, jwt, mail } from './configs';

export interface ConfigInterface {
  app: ConfigType<typeof app>;
  jwt: ConfigType<typeof jwt>;
  database: ConfigType<typeof database>;
  mail: ConfigType<typeof mail>;
}
