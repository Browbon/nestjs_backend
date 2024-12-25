import { applyDecorators } from '@nestjs/common';
import {
  IsNotEmpty,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { MinMaxLength } from './min-max-length.decorator';
import { USERNAME_REGEX } from 'common/constant';
import { validateI18nMessage } from 'lib/i18n';

@ValidatorConstraint({ async: true })
class IsUsernameConstraint implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async validate(value: string, _argument: ValidationArguments) {
    return USERNAME_REGEX.test(value);
  }

  defaultMessage(argument: ValidationArguments) {
    const property = argument.property;

    return `${property} must fulfill username's criteria`;
  }
}

export function IsUsername(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return function (object: Record<string, any>, propertyName: string | symbol) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName as string,
      options: validationOptions,
      constraints: [],
      validator: IsUsernameConstraint,
    });
  };
}

export function IsUsernameField(
  validationOptions?: ValidationOptions & {
    minLength?: number;
    maxLength?: number;
  },
) {
  return applyDecorators(
    IsNotEmpty({
      message: validateI18nMessage('validation.isNotEmpty'),
    }),
    MinMaxLength({
      minLength: validationOptions?.minLength ?? 5,
      maxLength: validationOptions?.maxLength ?? 50,
    }),
    IsUsername(validationOptions),
  );
}
