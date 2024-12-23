import { HelperService } from 'common/helpers';
import {
  Dictionary,
  EntityRepository,
  FilterQuery,
  OrderDefinition,
  QueryOrderMap,
} from '@mikro-orm/postgresql';
import { BaseEntity } from './base.enitty';
import { CursorType, QueryOrder } from 'common/@types/enums';
import { BadRequestException } from '@nestjs/common';
import { translate } from 'lib/i18n';
import {
  getOppositeOrder,
  getQueryOrder,
  OppositeOrder,
  Order,
  PaginateOptions,
  QBCursorPaginationOptions,
} from 'common/@types/interfaces';
import { CursorPaginationResponse } from 'common/@types/classes';

export class BaseRepository<T extends BaseEntity> extends EntityRepository<T> {
  private readonly encoding: BufferEncoding = 'base64';

  private getFilters<T>(
    cursor: keyof T,
    decoded: string | number | Date,
    order: Order | OppositeOrder,
  ): FilterQuery<Dictionary<T>> {
    // FilterQuery of Mikro query options
    return {
      [cursor]: {
        [order]: decoded,
      },
    };
  }

  /**
   * Take a date, string or number an return the base64 representation of it
   * @param value
   * @returns The base64 encoded value
   */
  encodeCursor(value: Date | string | number): string {
    let string = value.toString();

    if (value instanceof Date) string = value.getTime().toString();

    return Buffer.from(string, 'utf8').toString(this.encoding);
  }

  decodeCursor(
    cursor: string,
    cursorType: CursorType = CursorType.STRING,
  ): string | number | Date {
    const string = Buffer.from(cursor, this.encoding).toString('utf8');

    switch (cursorType) {
      case CursorType.DATE: {
        const millisUnix = Number.parseInt(string, 10);

        if (Number.isNaN(millisUnix))
          throw new BadRequestException(
            translate('exception.cursorInvalidDate'),
          );

        return new Date(millisUnix);
      }
      case CursorType.NUMBER: {
        const number = Number.parseInt(string, 10);

        if (Number.isNaN(number))
          throw new BadRequestException(
            translate('exception.cursorInvalidNumber'),
          );

        return number;
      }
      default: {
        return string;
      }
    }
  }

  private getOrderBy<T>(
    cursor: keyof T,
    order: QueryOrder,
  ): OrderDefinition<T> {
    return {
      [cursor]: order,
    } as QueryOrderMap<T>;
  }

  private paginateCursor<T>(
    dto: PaginateOptions<T>,
  ): CursorPaginationResponse<T> {
    const { instances, currentCount, previousCount, cursor, first, search } =
      dto;
    const pages: CursorPaginationResponse<T> = {
      data: instances,
      meta: {
        nextCursor: '',
        hasPreviousPage: false,
        hasNextPage: false,
        search: search ?? '',
      },
    };
    const length = instances.length;

    if (length > 0) {
      const last = instances[length - 1]![cursor] as string | number | Date;

      pages.meta.nextCursor = this.encodeCursor(last);
      pages.meta.hasNextPage = currentCount > first;
      pages.meta.hasPreviousPage = previousCount > 0;
    }

    return pages;
  }

  async qbCursorPagination<T extends Dictionary>(
    dto: QBCursorPaginationOptions<T>,
  ): Promise<CursorPaginationResponse<T>> {
    const { qb, pageOptionsDto } = dto;

    const {
      after,
      first,
      search,
      relations,
      alias,
      cursor,
      order,
      cursorType,
      fields,
      withDeleted,
      from: fromDate,
      to,
      searchField,
    } = pageOptionsDto;

    qb.where({
      isDeleted: withDeleted,
    });

    if (search != null && searchField != null) {
      qb.andWhere({
        [searchField]: {
          $ilike: HelperService.formatSearch(search),
        },
      });
    }

    if (relations != null) {
      for (const relation of relations)
        qb.leftJoinAndSelect(`${alias}.${relation}`, `${alias}_${relation}`); // a_b relation naming convention
    }

    if (fromDate) {
      qb.andWhere({
        createdAt: {
          $gte: fromDate,
        },
      });
    }

    if (to) {
      qb.andWhere({
        createdAt: {
          $lte: to,
        },
      });
    }

    let previousCount = 0;
    const stringCursor = String(cursor);
    const aliasCursor = `${alias}.${stringCursor}`;
    const selectedFields = [...new Set([...fields, 'id'])]; // Set can remove duplicated values

    if (after != null) {
      const decoded = this.decodeCursor(after, cursorType);
      const oppositeOd = getOppositeOrder(order);
      const temporaryQb = qb.clone();

      temporaryQb.andWhere(this.getFilters(cursor, decoded, oppositeOd));
      previousCount = await temporaryQb.count(aliasCursor, true);

      const normalOd = getQueryOrder(order);

      qb.andWhere(this.getFilters(cursor, decoded, normalOd));
    }

    const [entities, count]: [T[], number] = await qb
      .select(selectedFields)
      .orderBy(this.getOrderBy(cursor, order))
      .limit(first)
      .getResultAndCount();

    return this.paginateCursor({
      instances: entities,
      currentCount: count,
      previousCount,
      cursor,
      first,
      search,
    });
  }
}
