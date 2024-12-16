import { IsJWT, IsNotEmpty } from 'class-validator';
import { validateI18nMessage } from 'lib/i18n';

export class RefreshTokenDto {
  /**
   * Refresh token of user
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
   */
  @IsNotEmpty({ message: validateI18nMessage('validation.isNotEmpty') })
  @IsJWT({
    message: validateI18nMessage('validation.isDataType', {
      type: 'jwt',
    }),
  })
  refreshToken!: string;
}
