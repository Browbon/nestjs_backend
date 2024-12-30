import { IsBoolean } from 'class-validator';
import { PostStateEnum } from 'common/@types/enums';
import {
  IsEnumField,
  IsStringField,
  ToBoolean,
} from 'common/decorators/validation';
import { IsUUIDField } from 'common/decorators/validation/is-uuid.validator';
import { validateI18nMessage } from 'lib/i18n';

export class CreatePostDto {
  @IsStringField()
  title!: string;

  @IsStringField()
  description!: string;

  @IsStringField()
  content!: string;

  @IsUUIDField({ each: true })
  tags!: string[];

  @IsUUIDField({ each: true })
  categories!: string[];

  @IsEnumField(PostStateEnum, { required: false })
  state?: PostStateEnum;

  @ToBoolean()
  @IsBoolean({
    message: validateI18nMessage('validation.isDataType', {
      type: 'boolean',
    }),
  })
  published?: boolean;
}
