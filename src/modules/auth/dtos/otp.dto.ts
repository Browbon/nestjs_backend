import { PickType } from '@nestjs/swagger';
import { IsEmailField, IsStringField } from 'common/decorators/validation';

export class OtpVerifyDto {
  @IsStringField({
    minLength: 6,
    maxLength: 6,
  })
  otpCode!: string;

  @IsEmailField()
  email!: string;
}

export class SendOtpDto extends PickType(OtpVerifyDto, ['email'] as const) {}
