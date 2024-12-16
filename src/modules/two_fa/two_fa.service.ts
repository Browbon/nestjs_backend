import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Configs } from 'common/@types/typings/global';
import { BaseRepository } from 'common/databases';
import { User } from 'entities';
import { Observable } from 'rxjs';

@Injectable()
export class TwoFactorService {
  constructor(
    @InjectRepository('User')
    private readonly userRepository: BaseRepository<User>,
    private readonly configService: ConfigService<Configs, true>,
    private readonly em: EntityManager,
  ) {}

  generateTwoFactorSecret(
    user: User,
  ): Observable<{ secret: string; otpAuthUrl: string }> {}
}
