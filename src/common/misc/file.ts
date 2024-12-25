import { HttpStatus, ParseFilePipeBuilder } from '@nestjs/common';
import { FileSize, FileType } from 'common/@types/enums';
import { FileValidator } from 'common/@types/interfaces';
import { CustomUploadFileTypeValidator } from 'common/decorators/validation';

export function fileValidatorPipe({
  fileType = FileType.IMAGE,
  fileSize = FileSize.IMAGE,
  required = true,
}: FileValidator) {
  return new ParseFilePipeBuilder()
    .addValidator(
      new CustomUploadFileTypeValidator({
        fileType,
      }),
    )
    .addMaxSizeValidator({
      maxSize: fileSize,
      message: (maxSize) =>
        `File size should be less than ${Math.round(maxSize / 1024 / 1024)} MB`,
    })
    .build({
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      fileIsRequired: required,
    });
}
