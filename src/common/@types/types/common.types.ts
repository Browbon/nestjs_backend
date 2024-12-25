import { EntityDTO, FromEntityType, RequiredEntityData } from '@mikro-orm/core';
import { IFile } from '../interfaces';

export type Optional<T> = T | undefined;
export type Nullable<T> = T | null;

// Represent the type of DTO that containts a file or files
export type RecordWithFile<T, K = IFile> = T & {
  files: K;
};

export type UpdateEntityType<Entity> = Partial<
  EntityDTO<FromEntityType<Entity>>
>;
export type CreateEntityType<Entity> = RequiredEntityData<Entity>;
