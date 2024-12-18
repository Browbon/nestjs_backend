import { IsStringField } from 'common/decorators/validation';

export class ReferUserDto {
  @IsStringField()
  mobileNumber!: string;
}
