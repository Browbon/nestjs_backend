import { Action } from 'common/@types/enums';
import { PoliciesHandler } from './policy.interface';
import { NestifyRequest } from 'common/@types/typings/global';
import { AppAbility } from './casl-ability.factory';

export class GenericPolicyHandler implements PoliciesHandler {
  constructor(
    private readonly ClassType: any,
    private readonly action: Action = Action.READ,
  ) {}

  handle(request: NestifyRequest, ability: AppAbility) {
    /* Checking if the action is Create, Read, or Delete. If it is, it will return the
              ability.can(this.action, this.type) method. If it is not, it will return the
              ability.can(Action.Update, new this.type({ id })) method. */

    if ([Action.CREATE, Action.READ, Action.DELETE].includes(this.action))
      return ability.can(this.action, this.ClassType);

    const id = request.params.id;

    return ability.can(Action.UPDATE, new this.ClassType({ id }));
  }
}
