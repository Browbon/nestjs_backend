import { EntityManager, FilterQuery } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseRepository } from 'common/databases/base.repository';
import { User } from 'entities';
import { Configs } from 'lib/config/config.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: BaseRepository<User>,
    private readonly configService: ConfigService<Configs, true>,
    private readonly em: EntityManager,
  ) {}

  /**
   * Find an user with a given condition and return the user, otherwise throw UnauthorizationException
   * @param condition: FilterQuery
   * @returns Promise that resolves to a User object
   */
  async findUser(condition: FilterQuery<User>): Promise<User> {
    const user = await this.userRepository.findOne(condition);

    if (!user) throw new UnauthorizedException();
    return user;
  }
}
