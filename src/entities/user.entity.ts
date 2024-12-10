import {
  ManyToMany,
  Collection,
  Embeddable,
  Entity,
  Enum,
  Index,
  OneToMany,
  Property,
  Embedded,
  wrap,
  BeforeCreate,
  BeforeUpdate,
  BeforeUpsert,
  EventArgs,
} from '@mikro-orm/postgresql';
import { Role } from 'common/@types/enums';
import { BaseEntity } from 'common/databases';
import { BaseRepository } from 'common/databases/base.repository';
import { Conversation, Post } from './index';
import { HelperService } from 'common/helpers';

@Embeddable()
export class Social {
  @Property()
  twitter?: string;

  @Property()
  facbook?: string;

  @Property()
  linkedin?: string;
}

@Entity({ repository: () => BaseRepository<User> })
export class User extends BaseEntity {
  @Property()
  firstName!: string;

  @Property()
  middleName?: string;

  @Property()
  lastName!: string;

  @Property({ index: true, unique: true })
  username!: string;

  @Property({ index: true, unique: true })
  email!: string;

  @Property({ columnType: 'text' })
  bio!: string;

  @Property({ columnType: 'text' })
  avatar!: string;

  // Property marked as lazy normally not appear in most of query unless specifically required
  @Property({ hidden: true, columnType: 'text', lazy: true })
  password!: string;

  @Property()
  twoFactorSecret!: string;

  @Property()
  isTwoFactorEnabled?: boolean = false;

  @Index()
  @Enum({ items: () => Role, array: true }) // need to reverified, ts-morph setting but used reflect-metadata method???
  roles?: Role[] = [Role.AUTHOR];

  @Property({ index: true, unique: true })
  mobileNumber?: string;

  @Property()
  isVerified?: boolean = false;

  @OneToMany(() => Post, (post) => post.author, { orphanRemoval: true })
  posts = new Collection<Post>(this);

  @ManyToMany(() => Conversation, (conversation) => conversation.users, {
    owner: true,
  })
  conversations = new Collection<Conversation>(this);

  @Embedded(() => Social, { object: true, nullable: true })
  social?: Social;

  @ManyToMany({
    entity: () => User,
    inversedBy: (user) => user.followed,
    owner: true,
    pivotTable: 'user_to_follower',
    joinColumn: 'follower',
    inverseJoinColumn: 'following',
    hidden: true,
  })
  followers = new Collection<User>(this);

  @ManyToMany()
  followed = new Collection<User>(this);

  @Property()
  lastLogin?: Date;

  constructor(data?: Pick<User, 'idx'>) {
    super();
    Object.assign(this, data);
  }

  toJSON() {
    const object = wrap<User>(this).toObject();

    object.avatar =
      this.avatar ??
      `https://ui-avatars.com/api/?name=${this.firstName}+${this.lastName}&background=0D8ABC&color=fff`;

    return object;
  }

  // re-hashing password after create, update and insert
  @BeforeCreate()
  @BeforeUpdate()
  @BeforeUpsert()
  async hashPassword(eventArguments: EventArgs<this>) {
    if (eventArguments?.changeSet?.payload?.password !== null) {
      this.password = await HelperService.hashString(this.password);
    }
  }
}
