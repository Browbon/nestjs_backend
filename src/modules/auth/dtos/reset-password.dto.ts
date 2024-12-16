import { PickType } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import {
  IsEqualTo,
  IsPasswordField,
  IsStringField,
} from 'common/decorators/validation';
import { validateI18nMessage } from 'lib/i18n';

export class ResetPasswordDto {
  @IsStringField({ minLength: 6, maxLength: 6 })
  otpCode!: string;

  @IsPasswordField({ message: validateI18nMessage('validation.isPassword') })
  password!: string;

  @IsNotEmpty({ message: validateI18nMessage('validation.isNotEmpty') })
  @IsEqualTo('password')
  confirmPassword!: string;
}

export class ChangPasswordDto extends PickType(ResetPasswordDto, [
  'password',
  'confirmPassword',
] as const) {
  @IsPasswordField({ message: validateI18nMessage('validation.isPassword') })
  oldPassword!: string;
}
