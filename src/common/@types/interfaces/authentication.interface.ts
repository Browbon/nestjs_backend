export interface JwtPayLoad {
  jti?: number;
  sub: number;
  iat: number;
  exp: number;
  aud: number;
  iss: string;
  isTwoFactorEnabled?: boolean;
  roles?: string[];
}
