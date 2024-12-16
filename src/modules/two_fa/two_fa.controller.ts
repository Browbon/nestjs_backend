import { GenericController } from 'common/decorators';
import { AuthService } from 'modules/auth/auth.service';

@GenericController('2fa', false)
export class TwoFactorController {
  constructor(private readonly authService: AuthService) {}
}
