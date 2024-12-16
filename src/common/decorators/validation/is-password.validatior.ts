import { applyDecorators } from '@nestjs/common';
import {
  IsNotEmpty,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { validateI18nMessage } from 'lib/i18n';
import { MinMaxLength } from './min-max-length.decorator';
import { PASSWORD_REGEX } from 'common/constant';

@ValidatorConstraint({ async: true })
class IsPasswordConstraint implements ValidatorConstraintInterface {
  async validate(value: string, _arguments?: ValidationArguments) {
    return PASSWORD_REGEX.test(value);
  }
}

export function IsPassword(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return function (object: Record<string, any>, propertyName: string | symbol) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName as string,
      options: validationOptions,
      constraints: [],
      validator: IsPasswordConstraint,
    });
  };
}

export function IsPasswordField(
  validationOptions: ValidationOptions & {
    minLength?: number;
    maxLength?: number;
  },
) {
  return applyDecorators(
    IsNotEmpty({
      message: validateI18nMessage('validation.isNotEmpty'),
    }),
    MinMaxLength({
      minLength: validationOptions?.minLength ?? 8,
      maxLength: validationOptions?.maxLength ?? 40,
    }),
  );
}
