import { Dictionary } from '@mikro-orm/core';
import { CursorPaginationResponse, OffsetPaginationResponse } from '../classes';
import { QueryBuilder } from '@mikro-orm/postgresql';
import { CursorPaginationDto } from 'common/dtos';
import { CursorType, QueryOrder } from '../enums';

export interface QBCursorPaginationOptions<T extends Dictionary> {
  qb: QueryBuilder<T>;
  pageOptionsDto: Omit<CursorPaginationDto, 'type'> & {
    alias: string;
    cursor: keyof T;
    cursorType: CursorType;
    order: QueryOrder;
    searchField: keyof T;
  };
}

export interface PaginationAbstractResponse<T, Y> {
  data: T[];
  meta: Y;
}

export type PaginationResponse<T> =
  | CursorPaginationResponse<T>
  | OffsetPaginationResponse<T>;

export interface PaginateOptions<T> {
  instances: T[];
  currentCount: number;
  previousCount: number;
  cursor: keyof T;
  first: number;
  search?: string;
}

// Mikro
export type Order = '$gt' | '$lt'; // greater than or less than
export type OppositeOrder = `${Order}e`; // greater than or equal | less than or equal

export function getQueryOrder(order: QueryOrder): Order {
  return order === QueryOrder.ASC ? '$gt' : '$lt';
}

export function getOppositeOrder(order: QueryOrder): OppositeOrder {
  return order === QueryOrder.ASC ? '$lte' : '$gte';
}
