import { IsNotEmpty } from 'class-validator';
import { IsEmailField } from 'common/decorators/validation';
import { validateI18nMessage } from 'lib/i18n';

export class UserLoginDto {
  @IsEmailField()
  email!: string;

  @IsNotEmpty({ message: validateI18nMessage('validation.isNotEmpty') })
  password?: string;
}
