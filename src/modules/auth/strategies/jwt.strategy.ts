import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from 'common/@types/interfaces';
import { Configs } from 'common/@types/typings/global';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    config: ConfigService<Configs, true>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secrectOrKey: config.get('jwt.secret', { infer: true }),
    });
  }

  // Take decoded jwt token as argument and return the user
  async validate(payload: JwtPayload) {
    const { sub: id } = payload;

    return await this.authService.findUser(id);
  }
}
