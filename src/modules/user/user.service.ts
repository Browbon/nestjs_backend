import { MailPayload, PaginationResponse } from 'common/@types/interfaces';
import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { MikroORM, ref } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CursorType,
  QueryOrder,
  Queues,
  RoutingKey,
} from 'common/@types/enums';
import { Configs } from 'common/@types/typings/global';
import { BaseRepository } from 'common/databases';
import { Referral, User } from 'entities';
import { CloudinaryService } from 'lib/cloudinary';
import { MailerService } from 'lib/mailer/mailer.service';
import { from, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { ReferUserDto } from './dtos';
import { CursorPaginationDto } from 'common/dtos';

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
}
