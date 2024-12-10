import { randomUUID } from 'node:crypto';
import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { HelperService } from '../helpers';

@Entity({ abstract: true })
export abstract class BaseEntity {
  @PrimaryKey({ hidden: true, index: true })
  id!: number;

  // The unique id of the enitty
  @Property({ index: true })
  idx?: string = randomUUID();

  // To enable or disable the entity
  @Property()
  isActive?: boolean = true;

  // Marked true when entity is soft deleted
  @Property({ hidden: true })
  isDeleted?: boolean = false;

  // The date that entity was soft-deleted. Nullable because it's not set until the entity is soft-deleted
  @Property()
  deleteAt?: Date | null;

  // The day when entity is created
  @Property()
  createdAt?: Date = HelperService.getTimeInUtc(new Date());

  // The day when entity is last updated
  @Property({
    onUpdate: () => HelperService.getTimeInUtc(new Date()),
    hidden: true,
  })
  updatedAt?: Date = HelperService.getTimeInUtc(new Date());
}
