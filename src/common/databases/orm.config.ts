import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { Logger, NotFoundException } from '@nestjs/common';
import { HelperService } from '../helpers';
import { LoadStrategy } from '@mikro-orm/postgresql';
import { BaseRepository } from './base.repository';
import { MikroOrmModuleSyncOptions } from '@mikro-orm/nestjs';

const logger = new Logger('MikroOrm');

export const baseOptions: MikroOrmModuleSyncOptions = {
  dbName: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: +process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOST,
  entities: ['dist/entities/*.entity.js'],
  entitiesTs: ['src/entities/*.entity.ts'],
  findOneOrFailHandler: (entityName: string, key: any) => {
    return new NotFoundException(`${entityName} not found for ${key}`);
  },
  migrations: {
    fileName: (timestamp: string, name?: string) => {
      if (name === null) return `Migration${timestamp}`;
      return `Migration${timestamp}_${name}`;
    },
    tableName: 'migrations', // name of database table with log of executed transactions
    path: './migrations', // path to the folder with migrations
    pathTs: undefined, // path to the folder with Ts migrations (if used, we should put path to compiled files in 'path')
    glob: '!(*.d).{js,ts}', // how to match migration files (all .js and .ts files but not ,.d.ts files)
    transactional: true, // wrap each migration in a transaction
    allOrNothing: true, // wrap all migrations in master transaction
    snapshot: true, // save snapshot when creating new migrations
  },
  seeder: {
    path: './seeders', // path to the folder with seeders
    pathTs: undefined, // path to the folder with Ts seeders (if used, we should put path to compiled files in 'path')
    defaultSeeder: 'DatabaseSeeder', // default seeder class name
    glob: '!(*.d).{js,ts}', // how to match seeder files (all .js and .ts files but not .d.ts files)
  },
  logger: logger.log.bind(logger),
  metadataProvider: TsMorphMetadataProvider,
  highlighter: new SqlHighlighter(),
  debug: !HelperService.isProd(),
  loadStrategy: LoadStrategy.JOINED,
  entityRepository: BaseRepository,
  forceUtcTimezone: true,
  registerRequestContext: true,
  pool: { min: 2, max: 10 },
};
