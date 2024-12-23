import { applyDecorators } from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  Max,
  Min,
} from 'class-validator';
import { NumberFieldOptions } from 'common/@types/interfaces';
import { validateI18nMessage } from 'lib/i18n';

export function IsNumberField(options_?: NumberFieldOptions) {
  const options = {
    min: 1,
    required: true,
    each: false,
    max: Number.MAX_SAFE_INTEGER,
    minArraySize: 0,
    maxArraySize: Number.MAX_SAFE_INTEGER,
    int: true,
    positive: true,
    ...options_,
  } satisfies NumberFieldOptions;

  const decoratorsToApply = [
    Type(() => Number),
    Min(options.min, {
      message: validateI18nMessage('validation.min'),
      each: options.each,
    }),
    Max(options.max, {
      message: validateI18nMessage('validation.max'),
      each: options.each,
    }),
  ];

  if (options.int) {
    decoratorsToApply.push(
      IsInt({
        message: validateI18nMessage('validation.isDataType', {
          type: 'integer number',
        }),
        each: options.each,
      }),
    );
  } else {
    decoratorsToApply.push(
      IsNumber(
        {},
        {
          message: validateI18nMessage('validation.isDataType', {
            type: 'number',
          }),
          each: options.each,
        },
      ),
    );
  }

  if (options.positive) {
    decoratorsToApply.push(
      IsPositive({
        message: validateI18nMessage('validation.isDataType', {
          type: 'positive number',
        }),
        each: options.each,
      }),
    );
  }

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
