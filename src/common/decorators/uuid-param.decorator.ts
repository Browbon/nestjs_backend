import {
  HttpStatus,
  Param,
  ParseUUIDPipe,
  PipeTransform,
  Type,
} from '@nestjs/common';

class CustomException extends Error {
  message =
    'UUID must be a valid UUID format (e.g. xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)';
  statusCode = HttpStatus.BAD_REQUEST;
}

const exceptionFactory = () => new CustomException();

export function UUIDParam(
  property: string,
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
): ParameterDecorator {
  return Param(
    property,
    new ParseUUIDPipe({ version: '4', exceptionFactory }),
    ...pipes,
  );
}
