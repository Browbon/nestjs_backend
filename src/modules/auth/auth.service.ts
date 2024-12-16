import { EntityManager, FilterQuery } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseRepository } from 'common/databases/base.repository';
import { OtpLog, Protocol, User } from 'entities';
import { ResetPasswordDto, SendOtpDto, UserLoginDto } from './dtos';
import {
  from,
  map,
  mergeMap,
  Observable,
  of,
  switchMap,
  throwError,
  zip,
} from 'rxjs';
import { AuthenticationResponse } from 'common/@types/classes';
import { itemDoesNotExistKey, translate } from 'lib/i18n';
import { HelperService } from 'common/helpers';
import { TokenService } from 'modules/token';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { init } from '@paralleldrive/cuid2';
import { MailerService } from 'lib/mailer';
import { EmailSubject, EmailTemplate } from 'common/@types/enums';
import { Configs } from 'common/@types/typings/global';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: BaseRepository<User>,
    @InjectRepository(OtpLog)
    private readonly otpRepository: BaseRepository<OtpLog>,
    @InjectRepository(Protocol)
    private readonly protocolRepository: BaseRepository<Protocol>,
    private readonly configService: ConfigService<Configs, true>,
    private readonly mailService: MailerService,
    private readonly em: EntityManager<PostgreSqlDriver>,
    private readonly tokenService: TokenService,
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

  /**
   * Validate user with email and password, return if the password is correct
   * @param isPasswordLogin - boolean - the value decide whether the user using password to login or not
   * @param email - string - the email of user
   * @param pass - string - the password need to be validated
   * @returns The user object without password or error response
   */
  validateUser(
    isPasswordLogin: boolean,
    email: string,
    pass?: string,
  ): Observable<Omit<User, 'password'> | any> {
    return from(this.userRepository.findOne({ email })).pipe(
      switchMap((user) => {
        if (!user) {
          return throwError(
            () =>
              new ForbiddenException(
                translate('exception.itemDoesNotExist', {
                  args: { item: 'Account' },
                }),
              ),
          );
        }

        if (!user.isActive) {
          return throwError(
            () => new ForbiddenException(translate('exception.inactiveUser')),
          );
        }

        return user !== null && isPasswordLogin
          ? HelperService.verifyHash(user.password, pass!).pipe(
              map((isValid) => {
                if (isValid) return of(HelperService.omit(user, ['password']));

                return throwError(
                  () =>
                    new BadRequestException(
                      translate('exception.invalidCredentials'),
                    ),
                );
              }),
            )
          : of(HelperService.omit(user, ['password']));
      }),
    );
  }

  /**
   * Validate user first, if user is valid, generate access token and refresh token then return it
   * @param loginDto - The user login DTO
   * @param isPasswordLogin - The boolean parameter decide whether the user login using password or oauth
   * @returns - The observable of type IAuthenticationResponse
   */
  login(
    loginDto: UserLoginDto,
    isPasswordLogin = false,
  ): Observable<AuthenticationResponse> {
    return this.validateUser(
      isPasswordLogin,
      loginDto.email,
      loginDto.password,
    ).pipe(
      switchMap((user: User) => {
        if (user == null) {
          return throwError(
            () =>
              new BadRequestException(
                translate('exception.invalidCredentials'),
              ),
          );
        }

        if (user.isTwoFactorEnabled) {
          return this.tokenService.generateAccessToken(user).pipe(
            map((accessToken) => {
              return HelperService.buildPayloadResponse(user, accessToken);
            }),
          );
        }

        return zip(
          this.userRepository.nativeUpdate(
            { id: user.id },
            { lastLogin: new Date() },
          ),
          this.tokenService.generateAccessToken(user),
          this.tokenService.generateRefresToken(
            user,
            this.configService.get('jwt.refreshExpiry', { infer: true }),
          ),
        ).pipe(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          map(([_, accessToken, refreshToken]) => {
            return HelperService.buildPayloadResponse(
              user,
              accessToken,
              refreshToken,
            );
          }),
        );
      }),
    );
  }

  /**
   * Delete all refresh tokens for provided user
   * @param user - The user object need to be logged out for
   * @returns
   */
  logoutFromAll(user: User): Observable<User> {
    return this.tokenService.deleteUserRefreshToken(user);
  }

  logout(user: User, refreshToken: string): Observable<User> {
    return this.tokenService.decodeRefreshToken(refreshToken).pipe(
      switchMap((payload) => {
        return this.tokenService.deleteRefreshToken(user, payload);
      }),
    );
  }

  /**
   * Find userd details from Otp table by using the otp code and then update the password of user in user table
   * @param resetPassword - ResetPasswordDto
   * @returns Observable<User>
   */
  resetPassword(resetPassword: ResetPasswordDto): Observable<User> {
    const { password, otpCode } = resetPassword;

    return from(
      this.otpRepository.findOne({ otpCode }, { populate: ['user'] }),
    ).pipe(
      switchMap((details) => {
        if (!details)
          return throwError(
            () =>
              new NotFoundException(
                translate(itemDoesNotExistKey, {
                  args: { item: 'Otp' },
                }),
              ),
          );

        const user = details.user.getEntity();
        this.userRepository.assign(user, { password });

        return from(this.em.flush()).pipe(map(() => user));
      }),
    );
  }

  /**
   * Create a new OTP, send it to user's email and return the Otp
   * @param sendOtp - SendOtpDto
   * @returns Observable of type OtpLog
   */
  forgotPassword(sendOtp: SendOtpDto): Observable<{ message: string }> {
    const { email } = sendOtp;

    return from(this.userRepository.findOne({ email })).pipe(
      mergeMap((userExist) => {
        if (!userExist)
          return throwError(
            () =>
              new NotFoundException(
                translate(itemDoesNotExistKey, {
                  args: { item: 'Account' },
                }),
              ),
          );

        return from(
          this.protocolRepository.findOne({ isDeleted: false, isActive: true }),
        ).pipe(
          switchMap((protocol) => {
            const otpNumber = init({ length: 6 })();

            const otp = this.otpRepository.create({
              user: userExist,
              otpCode: otpNumber,
              expiresIn: new Date(
                Date.now() + (protocol.otpExpiryInMinutes ?? 5 * 600000),
              ),
            });

            return from(
              this.em.transactional(async (em) => {
                await em.persistAndFlush(otp);

                return this.mailService.sendMail({
                  template: EmailTemplate.RESET_PASSWORD_TEMPLATE,
                  replacements: {
                    firstName: HelperService.capitalize(userExist.firstName),
                    lastName: HelperService.capitalize(userExist.lastName),
                    otp: otpNumber,
                  },
                  to: userExist.email,
                  subject: EmailSubject.RESET_PASSWORD,
                  from: this.configService.get('mail.senderEmail', {
                    infer: true,
                  }),
                });
              }),
            ).pipe(
              map(() => ({
                message: 'Otp sent successfully!!!',
              })),
            );
          }),
        );
      }),
    );
  }
}
