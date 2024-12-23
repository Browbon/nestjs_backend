import { applyDecorators } from '@nestjs/common';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  MaxDate,
  MinDate,
} from 'class-validator';
import { DateFieldOptions } from 'common/@types/interfaces';
import { validateI18nMessage } from 'lib/i18n';

export function IsDateField(options_?: DateFieldOptions) {
  const options: DateFieldOptions = {
    each: false,
    required: true,
    minArraySize: 0,
    maxArraySize: Number.MAX_SAFE_INTEGER,
    lessThan: false,
    greaterThan: false,
    ...options_,
  } satisfies DateFieldOptions;

  const decoratorsToApply = [
    IsDateString(
      { strict: true },
      {
        message: validateI18nMessage('validation.isDataType', {
          type: 'date',
        }),
        each: options.each,
      },
    ),
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

  if (options.greaterThan) decoratorsToApply.push(MinDate(options.date!));

  if (options.lessThan) decoratorsToApply.push(MaxDate(options.date!));

  return applyDecorators(...decoratorsToApply);
}
