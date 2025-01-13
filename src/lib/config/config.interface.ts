import { ConfigType } from '@nestjs/config';
import {
  app,
  database,
  facebookOauth,
  googleOauth,
  jwt,
  mail,
  rabbitmq,
  redis,
} from './configs';

export interface ConfigInterface {
  app: ConfigType<typeof app>;
  jwt: ConfigType<typeof jwt>;
  database: ConfigType<typeof database>;
  mail: ConfigType<typeof mail>;
  googleAuth: ConfigType<typeof googleOauth>;
  facebookOauth: ConfigType<typeof facebookOauth>;
  rabbitmq: ConfigType<typeof rabbitmq>;
  redis: ConfigType<typeof redis>;
}
