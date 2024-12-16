import {
  Entity,
  ManyToOne,
  Opt,
  Property,
  Ref,
  Rel,
} from '@mikro-orm/postgresql';
import { BaseEntity } from 'common/databases';
import { User } from './user.entity';

@Entity()
export class OtpLog extends BaseEntity {
  @Property()
  expiresIn!: Date;

  @Property({
    length: 20,
    index: true,
  })
  otpCode?: string;

  @ManyToOne({
    index: true,
  })
  user!: Rel<Ref<User>>;

  @Property()
  isUsed: boolean & Opt = false;

  constructor(partial?: Partial<OtpLog>) {
    super();
    Object.assign(this, partial);
  }
}
