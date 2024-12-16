import { applyDecorators } from '@nestjs/common';
import { MaxLength, MinLength } from 'class-validator';
import { MinMaxLengthOptions } from 'common/@types/interfaces';
import { validateI18nMessage } from 'lib/i18n';

export function MinMaxLength(options_?: MinMaxLengthOptions) {
  const options = {
    minLength: 2,
    maxLength: 500,
    each: false,
    ...options_,
  } satisfies MinMaxLengthOptions;

  return applyDecorators(
    MinLength(options.minLength, {
      message: validateI18nMessage('validation.minLength'),
      each: options.each,
    }),
    MaxLength(options.maxLength, {
      message: validateI18nMessage('validation.maxLength'),
      each: options.each,
    }),
  );
}
