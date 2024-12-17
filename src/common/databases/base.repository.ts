import { EntityRepository } from '@mikro-orm/postgresql';
import { BaseEntity } from './base.enitty';

export class BaseRepository<T extends BaseEntity> extends EntityRepository<T> {}
