import { Auth, GenericController, SwaggerResponse } from 'common/decorators';
import { AuthService } from './auth.service';
import { TokenService } from 'modules/token';
import { Body, Get, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import {
  ChangePasswordDto,
  MagicLinkLogin,
  OtpVerifyDto,
  ResetPasswordDto,
  SendOtpDto,
  UserLoginDto,
} from './dtos';
import { map, Observable } from 'rxjs';
import { AuthenticationResponse } from 'common/@types/classes';
import { User } from 'entities';
import { NestifyRequest, NestifyResponse } from 'common/@types/typings/global';
import { MagicLoginStrategy } from './strategies';
import { AuthGuard } from '@nestjs/passport';
import { LoggedInUser } from 'common/decorators/user.decorator';
import { OauthResponse } from 'common/@types/interfaces';

@GenericController('auth', false)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
    private readonly magicStrategy: MagicLoginStrategy,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  login(@Body() loginDto: UserLoginDto): Observable<AuthenticationResponse> {
    return this.authService.login(loginDto);
  }

  @Post('login/magic')
  @ApiOperation({ summary: 'User login with magic link' })
  loginByMagicLink(
    @Req() request: NestifyRequest,
    @Res() response: NestifyResponse,
    @Body() dto: MagicLinkLogin,
  ): Observable<void> {
    return this.authService.validateUser(false, dto.destinationEmail).pipe(
      map(() => {
        this.magicStrategy.send(request, response);
      }),
    );
  }

  @Post('reset-password')
  @SwaggerResponse({
    operation: 'Reset password',
    notFound: "Otp doesn't exist.",
    badRequest: 'Otp is expired.',
  })
  resetUserPassword(@Body() dto: ResetPasswordDto): Observable<User> {
    return this.authService.resetPassword(dto);
  }

  @Auth()
  @Patch('forgot-password')
  @SwaggerResponse({
    operation: 'Forgot password',
    notFound: "Account doesn't exist.",
  })
  forgotPassword(@Body() dto: SendOtpDto): Observable<{ message: string }> {
    return this.authService.forgotPassword(dto);
  }

  @UseGuards(AuthGuard('magicLogin'))
  @Get('magiclogin/callback')
  magicCallback(@LoggedInUser() user: User, @Res() response: NestifyResponse) {
    return this.authService.login({ email: user.email }, false).pipe(
      map((data) => {
        // client url
        return response.redirect(
          `${process.env.API_URL}/${process.env.APP_PORT}/v1/auth/oauth/login?token=${data.accessToken}`,
        );
      }),
    );
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  googleAuth(@Req() _request: Request) {
    // the google auth redirect will be handled by passport
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(
    @LoggedInUser()
    user: OauthResponse,
    @Res() response: NestifyResponse,
  ) {
    return this.authService.OauthHandler({ response, user });
  }

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  facebookAuth(@Req() _request: Request) {
    // the facebook auth redirect will be handled by passport
  }

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  facebookAuthRedirect(
    @LoggedInUser()
    user: OauthResponse,
    @Res() response: NestifyResponse,
  ) {
    return this.authService.OauthHandler({ response, user });
  }

  @Post('verify-otp')
  @SwaggerResponse({
    operation: 'Verify otp',
    notFound: "Otp doesn't exist.",
    badRequest: 'Otp is expired.',
  })
  verifyOtp(@Body() dto: OtpVerifyDto): Observable<User> {
    return this.authService.verifyOtp(dto);
  }

  @Auth()
  @Post('change-password')
  @SwaggerResponse({
    operation: 'Change password',
    badRequest: 'Username and password provided does not match.',
  })
  changePassword(
    @Body() dto: ChangePasswordDto,
    @LoggedInUser() user: User,
  ): Observable<User> {
    return this.authService.changePassword(dto, user);
  }
}
