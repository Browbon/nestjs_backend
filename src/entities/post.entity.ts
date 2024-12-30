import {
  BeforeCreate,
  BeforeUpdate,
  BeforeUpsert,
  Collection,
  Entity,
  Enum,
  EventArgs,
  ManyToMany,
  ManyToOne,
  OneToMany,
  Opt,
  Property,
  Ref,
  Rel,
} from '@mikro-orm/postgresql';
import { BaseEntity } from 'common/databases';
import { Category, Comment, Tag, User } from './index';
import { PostStateEnum } from 'common/@types/enums';
import { HelperService } from 'common/helpers';

@Entity()
export class Post extends BaseEntity {
  @Property({ index: true })
  slug?: string;

  @Property({ index: true })
  title!: string;

  @Property({ type: 'text' })
  description!: string;

  @Property({ type: 'text' })
  content!: string;

  @Property()
  readingTime: number & Opt = 0;

  @Property()
  readCount: number & Opt = 0;

  @Property({ index: true })
  published: boolean & Opt = false;

  @Property()
  favoriteCount: number & Opt = 0;

  @ManyToOne({ index: true })
  author!: Rel<Ref<User>>;

  @OneToMany(() => Comment, (comment) => comment.post, { orphanRemoval: true })
  comments = new Collection<Comment>(this);

  @ManyToMany(() => Tag, (tag) => tag.posts, { owner: true })
  tags = new Collection<Tag>(this);

  @ManyToMany(() => Category, (category) => category.posts, { owner: true })
  categories = new Collection<Category>(this);

  @Enum({ items: () => PostStateEnum })
  state: PostStateEnum & Opt = PostStateEnum.DRAFT;

  constructor(partial?: Partial<Post>) {
    super();
    Object.assign(this, partial);
  }

  @BeforeCreate()
  @BeforeUpdate()
  @BeforeUpsert()
  async generateSlug(eventArguments: EventArgs<this>) {
    if (eventArguments.changeSet?.payload?.title != null) {
      this.slug = `${HelperService.slugify(
        this.title,
      )}-${Math.trunc(Math.random() * 36 ** 6).toString(36)}`;
    }
    this.readingTime = this.getReadingTime(this.content);
  }

  getReadingTime(content: string) {
    const avgWordsPerMin = 250;
    const count = content.match(/\w+/g)?.length ?? 0;

    return Math.ceil(count / avgWordsPerMin);
  }
}
