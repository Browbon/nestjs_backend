import { Auth, GenericController, SwaggerResponse } from 'common/decorators';
import { AuthService } from './auth.service';
import { TokenService } from 'modules/token';
import { Body, Patch, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ResetPasswordDto, SendOtpDto, UserLoginDto } from './dtos';
import { Observable } from 'rxjs';
import { AuthenticationResponse } from 'common/@types/classes';
import { User } from 'entities';

@GenericController('auth', false)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  login(@Body() loginDto: UserLoginDto): Observable<AuthenticationResponse> {
    return this.authService.login(loginDto);
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
}
