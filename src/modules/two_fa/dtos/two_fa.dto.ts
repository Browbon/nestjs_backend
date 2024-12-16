import { IsStringField } from 'common/decorators/validation';

export class TwofaDto {
  @IsStringField({ minLength: 1, required: true })
  code!: string;
}
