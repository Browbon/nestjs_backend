import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { EmailFieldOptions } from 'common/@types/interfaces';
import { HelperService } from 'common/helpers';
import { validateI18nMessage } from 'lib/i18n';

export function IsEmailField(options_?: EmailFieldOptions) {
  const options: EmailFieldOptions = {
    each: false,
    required: true,
    ...options_,
  };

  const decoratorToApply = [
    Transform(
      ({ value }: { value: string }) => {
        value.toLowerCase();
      },
      { toClassOnly: true },
    ),
    Transform(
      ({ value }): string =>
        typeof value === 'string' ? HelperService.normalizeEmail(value) : value,
      { toClassOnly: true },
    ),
    IsEmail(
      {},
      {
        message: validateI18nMessage('validation.isDataType', {
          type: 'email address',
        }),
        each: options.each,
      },
    ),
  ];

  if (options.required) {
    decoratorToApply.push(
      IsNotEmpty({
        message: validateI18nMessage('validation.isNotEmpty'),
        each: options.each,
      }),
    );

    if (options.each) {
      decoratorToApply.push(
        ArrayNotEmpty({
          message: validateI18nMessage('validation.isNotEmpty'),
        }),
      );
    } else {
      decoratorToApply.push(IsOptional());
    }

    if (options.each) {
      decoratorToApply.push(
        IsArray({
          message: validateI18nMessage('validation.isDataType', {
            type: 'array',
          }),
        }),
      );
    }

    return applyDecorators(...decoratorToApply);
  }
}
