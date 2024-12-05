import { EntityRepository } from '@mikro-orm/postgresql';
import { BaseEnity } from './base.enitty';

export class BaseRepository<T extends BaseEnity> extends EntityRepository<T> {}
