import {
  AbilityBuilder,
  createMongoAbility,
  ExtractSubjectType,
  InferSubjects,
  MongoAbility,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { Action, Role } from 'common/@types/enums';
import { Comment, Post, Tag, User } from 'entities';

export type Subjects =
  | InferSubjects<typeof User | typeof Post | typeof Comment | typeof Tag>
  | 'all';
export type AppAbility = MongoAbility<[Action, Subjects]>;

@Injectable()
export class CaslAbiltityFactory {
  createForUser(user: User) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      createMongoAbility,
    );

    // give the user ability to read and write to everything if they are admin, otherwise give read-only
    if (user.roles!.includes(Role.ADMIN)) {
      can(Action.MANAGE, 'all'); // read-write everything
    } else {
      can(Action.READ, 'all'); // read-only
    }

    // user specific permissions
    can(Action.UPDATE, User, { id: user.id });
    cannot(Action.DELETE, User);

    // post specific permissions
    can([Action.DELETE, Action.UPDATE], Post, { author: user });

    // comment specific permissions
    can([Action.DELETE, Action.UPDATE], Comment, { author: user });

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
