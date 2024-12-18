import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { MikroORM } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Configs } from 'common/@types/typings/global';
import { BaseRepository } from 'common/databases';
import { Referral, User } from 'entities';
import { MailerService } from 'lib/mailer/mailer.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: BaseRepository<User>,
    @InjectRepository(Referral)
    private readonly referralRepository: BaseRepository<Referral>,
    private readonly configService: ConfigService<Configs, true>,
    private readonly amqpConnection: AmqpConnection,
    private readonly mailService: MailerService,
    private readonly orm: MikroORM<PostgreSqlDriver>,
  ) {}
}
