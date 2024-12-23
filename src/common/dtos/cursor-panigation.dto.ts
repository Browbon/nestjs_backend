import { ApiHideProperty } from '@nestjs/swagger';
import { PaginationDto } from './panigation.dto';
import { Allow, IsBase64, IsEnum } from 'class-validator';
import { PaginationType } from 'common/@types/enums';
import { IsNumberField, IsStringField } from 'common/decorators/validation';
import { validateI18nMessage } from 'lib/i18n';

export class CursorPaginationDto extends PaginationDto {
  @ApiHideProperty()
  @Allow()
  @IsEnum(PaginationType)
  type: PaginationType = PaginationType.CURSOR;

  // The cursor pointer of the page that we are requesting
  @IsStringField({ required: true })
  @IsBase64(
    {},
    {
      message: validateI18nMessage('validation.isDataType', {
        type: 'base64',
      }),
    },
  )
  after?: string;

  @IsNumberField({ required: false })
  first?: number = 10;
}
