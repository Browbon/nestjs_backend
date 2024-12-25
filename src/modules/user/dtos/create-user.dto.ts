import { Type } from 'class-transformer';
import { IsNotEmpty, IsUrl, ValidateNested } from 'class-validator';
import { Role } from 'common/@types/enums';
import {
  IsEmailField,
  IsEnumField,
  IsPasswordField,
  IsStringField,
  IsUnique,
  IsUsernameField,
} from 'common/decorators/validation';
import { User } from 'entities';
import { validateI18nMessage } from 'lib/i18n';

export class SocialDto {
  @IsNotEmpty({ message: validateI18nMessage('validation.isNotEmpty') })
  @IsUrl()
  twitter?: string;

  @IsNotEmpty({ message: validateI18nMessage('validation.isNotEmpty') })
  @IsUrl()
  facebook?: string;

  @IsNotEmpty({ message: validateI18nMessage('validation.isNotEmpty') })
  @IsUrl()
  linkedin?: string;
}

export class CreateUserDto {
  @IsUsernameField()
  @IsUnique(() => User, 'username')
  username!: string;

  @IsStringField({ maxLength: 50 })
  firstName!: string;

  @IsStringField({ required: false, maxLength: 50 })
  middleName!: string;

  @IsStringField({ maxLength: 50 })
  lastName!: string;

  @IsUnique(() => User, 'email')
  @IsEmailField()
  email!: string;

  @IsStringField({ maxLength: 1000 })
  bio!: string;

  @IsPasswordField({ message: validateI18nMessage('validation.isPassword') })
  password!: string;

  @IsEnumField(Role, { each: true })
  roles!: Role[];

  @ValidateNested()
  @Type(() => SocialDto)
  social?: SocialDto;
}
