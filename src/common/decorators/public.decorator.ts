import { applyDecorators, SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY_META, SWAGGER_API_SECURITY_KEY_META } from '../constant';

const setPublicKeyMetadata = SetMetadata(IS_PUBLIC_KEY_META, true);
const setPublicAuthSwagger = SetMetadata(SWAGGER_API_SECURITY_KEY_META, [
  IS_PUBLIC_KEY_META,
]);

export const Public = () =>
  applyDecorators(setPublicKeyMetadata, setPublicAuthSwagger);
