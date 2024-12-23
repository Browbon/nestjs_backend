import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from './panigation.dto';
import { Allow, IsEnum } from 'class-validator';
import { PaginationType, QueryOrder } from 'common/@types/enums';
import {
  IsEnumField,
  IsNumberField,
  IsStringField,
} from 'common/decorators/validation';

export class OffsetPaginationDto extends PaginationDto {
  @ApiProperty()
  @Allow()
  @IsEnum(PaginationType)
  type: PaginationType = PaginationType.OFFSET;

  @IsNumberField({ required: false })
  readonly page = 1;

  @IsNumberField({ required: false, max: 50 })
  readonly limit = 10;

  @IsEnumField(QueryOrder, { required: false })
  readonly order: QueryOrder = QueryOrder.DESC;

  @IsStringField({ required: false, maxLength: 50 })
  readonly sort = 'createdAt';

  get offset(): number {
    return (this.page - 1) * this.limit;
  }
}
