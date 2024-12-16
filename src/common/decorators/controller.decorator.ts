import { applyDecorators, Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from './auth.decorator';

/**
 *
 * @param name :String - The name of controller
 * @param secure :Boolean - Whether or not the route shoule be secured
 * @returns The combined decorators
 */
export function GenericController(name: string, secure: boolean = false) {
  const decsToApply: (ClassDecorator | MethodDecorator | PropertyDecorator)[] =
    [ApiTags(name), Controller(name)];

  if (secure) decsToApply.push(Auth());
  return applyDecorators(...decsToApply);
}
