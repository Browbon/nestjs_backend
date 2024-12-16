import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { StringFieldOptions } from 'common/@types/interfaces';
import { validateI18nMessage } from 'lib/i18n';
import { MinMaxLength } from './min-max-length.decorator';
import { Sanitize, Trim } from './transform.decorator';
import { applyDecorators } from '@nestjs/common';

export function IsStringField(options_?: StringFieldOptions) {
  const options = {
    required: true,
    each: false,
    sanitize: true,
    trim: true,
    minLength: 2,
    maxLength: Number.MAX_SAFE_INTEGER,
    minArraySize: 0,
    maxArraySize: Number.MAX_SAFE_INTEGER,
    ...options_,
  } satisfies StringFieldOptions;

  const decoratorsToApply = [
    IsString({
      message: validateI18nMessage('validation.isDataType', {
        type: 'string',
      }),
      each: options.each,
    }),
    MinMaxLength({
      minLength: options.minLength,
      maxLength: options.maxLength,
      each: options.each,
    }),
  ];

  if (options.sanitize) decoratorsToApply.push(Sanitize());

  if (options.regex) decoratorsToApply.push(Matches(options.regex));

  if (options.trim) decoratorsToApply.push(Trim());

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
      ArrayMaxSize(options.maxArraySize),
      ArrayMinSize(options.minArraySize),
    );
  }

  return applyDecorators(...decoratorsToApply);
}
