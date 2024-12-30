import { applyDecorators } from '@nestjs/common';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { UUIDFieldOptions } from 'common/@types/interfaces';
import { validateI18nMessage } from 'lib/i18n';

export function IsUUIDField(options_?: UUIDFieldOptions) {
  const options = {
    each: false,
    required: true,
    ...options_,
  } satisfies UUIDFieldOptions;

  const decoratorsToApply = [
    IsUUID('4', {
      message: validateI18nMessage('validation.isDataType', {
        type: 'uuid',
      }),
      each: options.each,
    }),
  ];

  if (options.required) {
    decoratorsToApply.push(
      IsNotEmpty({
        message: validateI18nMessage('validation.isNotEmpty'),
        each: options.each,
      }),
    );

    if (options.each) {
      decoratorsToApply.push(
        ArrayNotEmpty({
          message: validateI18nMessage('validation.isNotEmpty'),
        }),
      );
    }
  } else {
    decoratorsToApply.push(IsOptional());
  }

  if (options.each) {
    decoratorsToApply.push(
      IsArray({
        message: validateI18nMessage('validation.isDataType', {
          type: 'array',
        }),
      }),
    );
  }

  return applyDecorators(...decoratorsToApply);
}
