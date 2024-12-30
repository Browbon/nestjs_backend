import { IsStringField } from 'common/decorators/validation';

export class CreateCommentDto {
  @IsStringField()
  body!: string;
}
