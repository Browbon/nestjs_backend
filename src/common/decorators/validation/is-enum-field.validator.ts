import { HelperService } from 'common/helpers';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { EnumFieldOptions } from 'common/@types/interfaces';
import { i18nValidationMessage } from 'nestjs-i18n';
import { applyDecorators } from '@nestjs/common';

export function IsEnumField(
  entity: Record<string, string>,
  options_?: EnumFieldOptions,
) {
  const options: EnumFieldOptions = {
    each: false,
    required: true,
    minArraySize: 0,
    maxArraySize: Number.MAX_SAFE_INTEGER,
    ...options_,
  };
  const decoratorsToApply = [
    IsEnum(entity, {
      each: options.each,
      message: `must be a valid enum value,${HelperService.enumToString(entity)}`,
    }),
  ];

  if (options.required) {
    decoratorsToApply.push(
      IsNotEmpty({
        message: i18nValidationMessage('validation.isNotEmpty'),
        each: options.each,
      }),
    );

    if (options.each) {
      decoratorsToApply.push(
        ArrayNotEmpty({
          message: i18nValidationMessage('validation.isNotEmpty'),
        }),
      );
    }
  } else {
    decoratorsToApply.push(IsOptional());
  }

  if (options.each) {
    decoratorsToApply.push(
      IsArray({
        message: i18nValidationMessage('validation.isDataType', {
          type: 'array',
        }),
      }),
    );
  }

  return applyDecorators(...decoratorsToApply);
}
