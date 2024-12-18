import {
  Entity,
  Enum,
  ManyToOne,
  Opt,
  Property,
  Ref,
  Rel,
} from '@mikro-orm/postgresql';
import { BaseEntity } from 'common/databases';
import { User } from './user.entity';
import { ReferralStatus } from 'common/@types/enums';

@Entity()
export class Referral extends BaseEntity {
  @ManyToOne({
    index: true,
  })
  referrer!: Rel<Ref<User>>;

  @Property({
    index: true,
  })
  mobileNumber!: string;

  @Enum({ items: () => ReferralStatus, index: true })
  status: ReferralStatus & Opt = ReferralStatus.PENDING;

  constructor(partial?: Partial<Referral>) {
    super();
    Object.assign(this, partial);
  }
}
