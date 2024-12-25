import { HelperService } from 'common/helpers';
import {
  IFile,
  MailPayload,
  PaginationResponse,
} from 'common/@types/interfaces';
import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { MikroORM, ref } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CursorType,
  EmailSubject,
  EmailTemplate,
  QueryOrder,
  Queues,
  RoutingKey,
} from 'common/@types/enums';
import { Configs } from 'common/@types/typings/global';
import { BaseRepository } from 'common/databases';
import { Referral, User } from 'entities';
import { CloudinaryService } from 'lib/cloudinary';
import { MailerService } from 'lib/mailer/mailer.service';
import {
  from,
  map,
  mergeMap,
  Observable,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { CreateUserDto, EditUserDto, ReferUserDto } from './dtos';
import { CursorPaginationDto } from 'common/dtos';
import { RecordWithFile } from 'common/@types/types/common.types';
import { itemDoesNotExistKey, translate } from 'lib/i18n';

@Injectable()
export class UserService {
  private readonly queryName = 'u'; // Alias

  constructor(
    @InjectRepository(User)
    private readonly userRepository: BaseRepository<User>,
    @InjectRepository(Referral)
    private readonly referralRepository: BaseRepository<Referral>,
    private readonly configService: ConfigService<Configs, true>,
    private readonly amqpConnection: AmqpConnection,
    private readonly cloudinaryService: CloudinaryService,
    private readonly mailService: MailerService,
    private readonly orm: MikroORM<PostgreSqlDriver>,
  ) {}

  @RabbitSubscribe({
    routingKey: RoutingKey.SEND_MAIL,
    exchange: process.env.RABBITMQ_EXCHANGE,
    queue: Queues.MAIL,
  })
  sendMail(payload: MailPayload) {
    return from(
      this.mailService.sendMail({
        template: payload.template,
        replacements: payload.replacements,
        to: payload.to,
        subject: payload.subject,
        from: payload.from,
      }),
    ).pipe(map(tap(() => Logger.log(`✅ Sent mail to ${payload.to}`))));
  }

  /**
   * Check the given mobile number whether it already exists within an user,
   * if not, we create a referral with that mobile number and the referrer user
   * @param dto - ReferUserDto
   * @param user - User
   * @returns Observable<Referral>
   */
  referUser(dto: ReferUserDto, user: User): Observable<Referral> {
    const userExists$ = from(
      this.userRepository.count({
        mobileNumber: dto.mobileNumber,
        isActive: true,
        isDeleted: false,
      }),
    );

    return userExists$.pipe(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      switchMap((count: number, _index: number) => {
        if (count > 0) {
          return throwError(
            () =>
              new BadRequestException(
                'User already registered with mobile number.',
              ),
          );
        }

        // return an empty observable or undefined based on your requirements
        return of(
          this.referralRepository.create({
            mobileNumber: dto.mobileNumber,
            referrer: ref(user),
          }),
        );
      }),
    );
  }

  /**
   *
   * @param index - String The index of user need to be found
   * @returns Observable<User>
   */
  findOne(index: string): Observable<User> {
    return from(
      this.userRepository.findOne({
        idx: index,
        isDeleted: false,
      }),
    ).pipe(
      mergeMap((user) => {
        if (!user) {
          return throwError(
            () =>
              new NotFoundException(
                translate(itemDoesNotExistKey, {
                  args: { item: 'User' },
                }),
              ),
          );
        }

        return of(user);
      }),
    );
  }

  /**
   * Return a list of users with cursor paginated format
   * @param dto - CursorPaginationDto
   * @returns PaginationResponse<User>
   */
  findAll(dto: CursorPaginationDto): Observable<PaginationResponse<User>> {
    const qb = this.userRepository.createQueryBuilder(this.queryName);

    return from(
      this.userRepository.qbCursorPagination({
        qb,
        pageOptionsDto: {
          alias: this.queryName,
          cursor: 'username',
          cursorType: CursorType.STRING,
          order: QueryOrder.ASC,
          searchField: 'firstName',
          ...dto,
        },
      }),
    );
  }

  create(dto: RecordWithFile<CreateUserDto>): Observable<User> {
    const { files, ...rest } = dto;
    const user = this.userRepository.create({
      ...rest,
      avatar: '',
    });

    return from(
      this.orm.em.transactional(async (em) => {
        const response = await this.cloudinaryService.uploadFile(files);

        // cloudinary gives a url key on response that is the full url to file

        user.avatar = response.url as string;

        await em.persistAndFlush(user);
        const link = this.configService.get('app.clientUrl', { infer: true });

        await this.amqpConnection.publish(
          this.configService.get('rabbitmq.exchange', { infer: true }),
          RoutingKey.SEND_MAIL,
          {
            template: EmailTemplate.WELCOME_TEMPLATE,
            replacements: {
              firstName: HelperService.capitalize(user.firstName),
              link,
            },
            to: user.email,
            subject: EmailSubject.WELCOME,
            from: this.configService.get('mail.senderEmail', { infer: true }),
          },
        );
      }),
    ).pipe(map(() => user));
  }

  /**
   * Update the user with dto and image
   * @param index - String The index of user
   * @param dto - EditUserDto
   * @param image - IFile
   * @returns
   */
  update(index: string, dto: EditUserDto, image?: IFile): Observable<User> {
    let uploadImage$: Observable<string>;

    return this.findOne(index).pipe(
      switchMap((user) => {
        if (image) {
          uploadImage$ = from(this.cloudinaryService.uploadFile(image)).pipe(
            switchMap(({ url }) => {
              const stringUrl = url as string;
              return of(stringUrl);
            }),
          );
        }

        this.userRepository.assign(user, dto);

        return uploadImage$.pipe(
          switchMap((url) => {
            if (url) user.avatar = url;

            return from(this.userRepository.getEntityManager().flush()).pipe(
              switchMap(() => {
                return of(user);
              }),
            );
          }),
        );
      }),
    );
  }

  remove(index: string): Observable<User> {
    return this.findOne(index).pipe(
      switchMap((user) => {
        return this.userRepository
          .softRemoveAndFlush(user)
          .pipe(map(() => user));
      }),
    );
  }
}
