import { Auth, GenericController } from 'common/decorators';
import { AuthService } from 'modules/auth/auth.service';
import { TwoFactorService } from './two_fa.service';
import {
  Body,
  Post,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NestifyResponse } from 'common/@types/typings/global';
import { LoggedInUser } from 'common/decorators/user.decorator';
import { User } from 'entities';
import { Observable, switchMap, throwError } from 'rxjs';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthenticationResponse } from 'common/@types/classes';
import { TwofaDto } from './dtos/two_fa.dto';

@GenericController('2fa', false)
export class TwoFactorController {
  constructor(
    private readonly authService: AuthService,
    private readonly twoFactorService: TwoFactorService,
  ) {}

  @Post('generate')
  @UseGuards(AuthGuard('jwt2fa'))
  register(
    @Res() response: NestifyResponse,
    @LoggedInUser() user: User,
  ): Observable<unknown> {
    return this.twoFactorService
      .generateTwoFactorSecret(user)
      .pipe(
        switchMap(({ otpAuthUrl }) =>
          this.twoFactorService.pipeQrCodeStream(response, otpAuthUrl),
        ),
      );
  }

  @ApiBearerAuth()
  @Post('authenticate')
  @UseGuards(AuthGuard('jwt2fa'))
  authenticate(
    @LoggedInUser() user: User,
    @Body()
    twoFaAuthDto: TwofaDto,
  ): Observable<AuthenticationResponse> {
    const isCodeValid = this.twoFactorService.isTwoFactorCodeValid(
      twoFaAuthDto.code,
      user,
    );

    if (!isCodeValid) return throwError(() => new UnauthorizedException());

    return this.authService.login(user, true);
  }

  @Auth()
  @Post('turn-on')
  turnOnTwoFactorAuthentication(
    @LoggedInUser() user: User,
    @Body()
    dto: TwofaDto,
  ): Observable<User> {
    return this.twoFactorService.turnOnTwoFactorAuthentication(dto.code, user);
  }
}
