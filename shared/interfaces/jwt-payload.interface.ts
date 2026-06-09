export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iss?: string;
  iat?: number;
  exp?: number;
}
