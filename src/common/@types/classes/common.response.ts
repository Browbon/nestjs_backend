export class AuthenticationResponse {
  user!: { id: number; idx?: string };
  accessToken!: string;
  refreshToken?: string;
}
