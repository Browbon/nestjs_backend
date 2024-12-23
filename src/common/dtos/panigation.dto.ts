import { IsBoolean, IsOptional } from 'class-validator';
import { IsDateField, IsStringField } from 'common/decorators/validation';
import { i18nValidationMessage } from 'nestjs-i18n';

export abstract class PaginationDto {
  @IsOptional()
  @IsDateField()
  from?: Date;

  @IsOptional()
  @IsDateField()
  to?: Date;

  @IsOptional()
  @IsStringField({ required: false, minLength: 1, maxLength: 100 })
  search?: string;

  @IsOptional()
  @IsBoolean({
    message: i18nValidationMessage('validation.isDataType', {
      type: 'boolean',
    }),
  })
  withDeleted: boolean = false;

  // The entities that we need to populated with
  @IsStringField({ required: false, each: true })
  relations: string[] = [];

  // The properties of entities we required above
  @IsStringField({ required: false, each: true })
  fields: string[] = [];
}
