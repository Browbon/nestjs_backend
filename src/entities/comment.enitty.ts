import { Post, User } from './index';
import { Entity, ManyToOne, Property, Ref, Rel } from '@mikro-orm/postgresql';
import { BaseEntity } from 'common/databases';

@Entity()
export class Comment extends BaseEntity {
  @Property()
  body!: string;

  @ManyToOne({ index: true })
  post!: Rel<Ref<Post>>;

  @ManyToOne({ index: true })
  author!: Rel<Ref<User>>;

  constructor(partial?: Partial<Comment>) {
    super();
    Object.assign(this, partial);
  }
}
