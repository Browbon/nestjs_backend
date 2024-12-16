import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import { Configs } from 'common/@types/typings/global';
import { JwtPayload } from 'common/@types/interfaces';

export class JwtTwoFactorStrategy extends PassportStrategy(Strategy, 'jwt2fa') {
  constructor(
    private readonly authService: AuthService,
    config: ConfigService<Configs, true>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('jwt.secret', { infer: true }),
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload) {
    const { sub: id } = payload;

    // Accept the JWT and attempt to validate it using the user service
    return this.authService.findUser({ id });
  }
}
