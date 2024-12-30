import { HelperService } from 'common/helpers';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  AutoPath,
  EntityKey,
  EntityManager,
  PostgreSqlDriver,
  ref,
} from '@mikro-orm/postgresql';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CursorType, QueryOrder } from 'common/@types/enums';
import { PaginationResponse } from 'common/@types/interfaces';
import { BaseRepository } from 'common/databases';
import { CursorPaginationDto } from 'common/dtos';
import { Category, Comment, Post, Tag, User } from 'entities';
import { itemDoesNotExistKey, translate } from 'lib/i18n';
import {
  forkJoin,
  from,
  map,
  mergeMap,
  Observable,
  of,
  switchMap,
  throwError,
  zip,
} from 'rxjs';
import { CreateCommentDto, CreatePostDto, EditPostDto } from './dtos';

@Injectable()
export class PostService {
  private readonly queryAlias = 'p';

  constructor(
    @InjectRepository(Post)
    private readonly postRepository: BaseRepository<Post>,
    @InjectRepository(User)
    private readonly userRepository: BaseRepository<User>,
    @InjectRepository(Comment)
    private readonly commentRepository: BaseRepository<Comment>,
    @InjectRepository(Tag)
    private readonly tagRepository: BaseRepository<Tag>,
    @InjectRepository(Category)
    private readonly categoryRepository: BaseRepository<Category>,
    private readonly em: EntityManager<PostgreSqlDriver>,
  ) {}

  /**
   * Return an paginated object
   * @param dto - CursorPainationDto
   * @returns Observable<PaginationResponse<Post>>
   */
  findAll(dto: CursorPaginationDto): Observable<PaginationResponse<Post>> {
    const qb = this.postRepository.createQueryBuilder(this.queryAlias);

    return from(
      this.postRepository.qbCursorPagination({
        qb,
        pageOptionsDto: {
          alias: this.queryAlias,
          cursor: 'title',
          cursorType: CursorType.STRING,
          order: QueryOrder.ASC,
          searchField: 'title',
          ...dto,
        },
      }),
    );
  }

  /**
   * Finds a post with its slug and return commets of that post
   * @param slug - String
   * @param populate - AutoPath<Post, EntityKey<Post>>
   * @returns Observable<Post>
   */
  findOne(
    slug: string,
    populate: AutoPath<Post, EntityKey<Post>>[] = [],
  ): Observable<Post> {
    return from(
      this.postRepository.findOne(
        {
          slug,
        },
        { populate },
      ),
    ).pipe(
      mergeMap((post) => {
        if (!post) {
          return throwError(
            () =>
              new NotFoundException(
                translate(itemDoesNotExistKey, {
                  args: { item: 'Post' },
                }),
              ),
          );
        }

        return of(post);
      }),
    );
  }

  /**
   * Creates a post based on dto and author then returns it
   * @param dto - CreatePostDto
   * @param author - User
   * @returns Observable<Post>
   */
  create(dto: CreatePostDto, author: User): Observable<Post> {
    return zip(
      this.tagRepository.find({
        idx: dto.tags,
      }),
      this.categoryRepository.find({
        idx: dto.categories,
      }),
    ).pipe(
      switchMap(([tags, categories]) => {
        const post = this.postRepository.create({
          ...HelperService.omit(dto, ['tags', 'categories']),
          author,
          categories,
          tags,
          published: dto.published ?? false,
        });

        return from(this.em.persistAndFlush(post)).pipe(map(() => post));
      }),
    );
  }

  /**
   * Get the post by slug and update new values into it
   * @param slug - String
   * @param dto - EditPostDto
   * @returns Observable<Post>
   */
  update(slug: string, dto: EditPostDto): Observable<Post> {
    return this.findOne(slug).pipe(
      switchMap((post) => {
        if (dto.tags) {
          return from(
            this.tagRepository.find({
              idx: dto.tags,
            }),
          ).pipe(
            switchMap((tags) => {
              this.postRepository.assign(post, {
                ...HelperService.omit(dto, ['tags', 'categories']),
                tags: tags,
              });

              return from(this.em.flush()).pipe(map(() => post));
            }),
          );
        }

        this.postRepository.assign(
          post,
          HelperService.omit(dto, ['tags', 'categories']),
        );

        return from(this.em.flush()).pipe(map(() => post));
      }),
    );
  }

  /**
   * Remove the post with its slug and return it
   * @param slug - String
   * @returns Observable<Post>
   */
  remove(slug: string): Observable<Post> {
    return this.findOne(slug).pipe(
      switchMap((post) => {
        return this.postRepository
          .softRemoveAndFlush(post)
          .pipe(map(() => post));
      }),
    );
  }

  /**
   * Find the post with its slug, add favorite post to user's favorites and increase user's favorite count
   * @param userId - Number
   * @param slug - String
   * @returns Observable<Post>
   */
  favorite(userId: number, slug: string): Observable<Post> {
    const post$ = from(this.postRepository.findOneOrFail({ idx: slug }));
    const user$ = from(
      this.userRepository.findOneOrFail(
        { id: userId },
        {
          populate: ['favorites'],
          populateWhere: {
            favorites: { isActive: true, isDeleted: false },
          },
        },
      ),
    );

    // forkJoin will handle asynchronous operations simutaniously, similar Promise.all()
    return forkJoin([post$, user$]).pipe(
      switchMap(([post, user]) => {
        if (!user.favorites.contains(post)) {
          user.favorites.add(post);
          post.favoriteCount = (post.favoriteCount ?? 0) + 1;
        }

        return from(this.em.flush()).pipe(map(() => post));
      }),
    );
  }

  /**
   * Find the post with its slug, remove favorite post from user's favorites and decrease user's favorite count
   * @param userId - Number
   * @param slug - String
   * @returns Observable<Post>
   */
  unFavorite(userId: number, slug: string): Observable<Post> {
    const post$ = from(
      this.postRepository.findOneOrFail({
        idx: slug,
      }),
    );
    const user$ = from(
      this.userRepository.findOneOrFail(
        { id: userId },
        {
          populate: ['favorites'],
          populateWhere: {
            favorites: { isActive: true, isDeleted: false },
          },
        },
      ),
    );

    return forkJoin([post$, user$]).pipe(
      switchMap(([post, user]) => {
        if (!user.favorites.contains(post)) {
          user.favorites.remove(post);
          post.favoriteCount = (post.favoriteCount ?? 0) - 1;
        }

        return from(this.em.flush()).pipe(map(() => post));
      }),
    );
  }

  /**
   * Find commets with slug and return it
   * @param slug - String
   * @returns Observable<Comment[]>
   */
  findComments(slug: string): Observable<Comment[]> {
    return from(
      this.postRepository.findOne(
        { slug },
        {
          populate: ['comments'],
          populateWhere: {
            comments: { isActive: true, isDeleted: false },
          },
        },
      ),
    ).pipe(
      switchMap((post) => {
        if (!post) {
          return throwError(
            () =>
              new NotFoundException(
                translate(itemDoesNotExistKey, {
                  args: { item: 'Post' },
                }),
              ),
          );
        }
        return of(post.comments.getItems());
      }),
    );
  }

  /**
   * Create comment with content and userId, add it to post and return the post
   * @param userId - Number
   * @param slug - String
   * @param dto - CreateCommentDto
   * @returns Observable<Post>
   */
  addComment(
    userId: number,
    slug: string,
    dto: CreateCommentDto,
  ): Observable<Post> {
    const post$ = this.findOne(slug);
    const user$ = from(this.userRepository.findOneOrFail(userId));

    return forkJoin([post$, user$]).pipe(
      switchMap(([post, user]) => {
        const comment = new Comment({ body: dto.body, author: ref(user) });

        post.comments.add(comment);

        return from(this.em.flush()).pipe(map(() => post));
      }),
    );
  }

  /**
   * Edit existed comment of a post
   * @param slug - String
   * @param commentIndex - String
   * @param commentData - CreateCommentDto
   * @returns
   */
  editComment(
    slug: string,
    commentIndex: string,
    commentData: CreateCommentDto,
  ) {
    return this.findOne(slug, ['comments']).pipe(
      switchMap((_post) => {
        return from(
          this.commentRepository.findOneOrFail({ idx: commentIndex }),
        ).pipe(
          switchMap((comment) => {
            this.commentRepository.assign(comment, commentData);

            return from(this.em.flush()).pipe(map(() => _post));
          }),
        );
      }),
    );
  }

  /**
   * Delete an existed comment from a post
   * @param slug - String
   * @param commentIndex - String
   * @returns Observable<Post>
   */
  deleteComment(slug: string, commentIndex: string): Observable<Post> {
    return forkJoin([
      this.findOne(slug),
      from(this.commentRepository.findOneOrFail({ idx: commentIndex })),
    ]).pipe(
      switchMap(([post, comment]) => {
        const commentReference = this.commentRepository.getReference(
          comment.id,
        );

        if (post.comments.contains(commentReference)) {
          post.comments.remove(commentReference);
          from(this.em.removeAndFlush(commentReference)).pipe(map(() => post));
        }

        return of(post);
      }),
    );
  }
}
