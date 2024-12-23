import { ApiProperty } from '@nestjs/swagger';
import { PaginationAbstractResponse } from '../interfaces';
import { OffsetPaginationDto } from 'common/dtos';
import { IsArray } from 'class-validator';

export class OffsetMeta {
  @ApiProperty()
  readonly page: number;

  @ApiProperty()
  readonly limit: number;

  @ApiProperty()
  readonly itemCount: number;

  @ApiProperty()
  readonly pageCount: number;

  @ApiProperty()
  readonly isPreviousPage: boolean;

  @ApiProperty()
  readonly isNextPage: boolean;

  constructor({
    pageOptionsDto,
    itemCount,
  }: {
    pageOptionsDto: Omit<OffsetPaginationDto, 'type'>;
    itemCount: number;
  }) {
    this.page = pageOptionsDto.page;
    this.limit = pageOptionsDto.limit;
    this.itemCount = itemCount;
    this.pageCount = Math.ceil(this.itemCount / this.limit);
    this.isPreviousPage = this.page > 1;
    this.isNextPage = this.page < this.pageCount;
  }
}

export class OffsetPaginationResponse<T>
  implements PaginationAbstractResponse<T, OffsetMeta>
{
  @ApiProperty({ isArray: true })
  @IsArray()
  readonly data: T[];

  @ApiProperty({ type: () => OffsetMeta })
  readonly meta: OffsetMeta;

  constructor(data: T[], meta: OffsetMeta) {
    this.data = data;
    this.meta = meta;
  }
}
