import {
  BeforeCreate,
  BeforeUpdate,
  BeforeUpsert,
  Collection,
  Entity,
  EventArgs,
  ManyToMany,
  Property,
} from '@mikro-orm/postgresql';
import { BaseEntity } from 'common/databases';
import { Post } from './index';
import { HelperService } from 'common/helpers';

@Entity()
export class Tag extends BaseEntity {
  @Property({ length: 50, index: true, unique: true })
  title!: string;

  @Property({ columnType: 'text' })
  description!: string;

  @Property({ index: true })
  slug?: string;

  @ManyToMany(() => Post, (post) => post.tags)
  posts = new Collection<Post>(this);

  constructor(partial?: Partial<Tag>) {
    super();
    Object.assign(this, partial);
  }

  @BeforeCreate()
  @BeforeUpdate()
  @BeforeUpsert()
  generateSlug(eventArguments: EventArgs<this>) {
    if (eventArguments?.changeSet?.payload?.title !== null) {
      this.slug = HelperService.slugify(this.title);
    }
  }
}
