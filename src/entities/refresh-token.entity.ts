import { User } from '../entities';
import {
  Entity,
  ManyToOne,
  Opt,
  Property,
  Ref,
  Rel,
} from '@mikro-orm/postgresql';
import { BaseEntity } from '../common/databases';

@Entity()
export class RefreshToken extends BaseEntity {
  @Property()
  expiredIn!: Date;

  @ManyToOne({ index: true })
  user!: Rel<Ref<User>>;

  @Property({ index: true })
  isRevoked: boolean & Opt = false;

  constructor(partial?: Partial<RefreshToken>) {
    super();
    Object.assign(this, partial);
  }
}
