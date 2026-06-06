export interface JwtPayload {
  sub: string;     // user_id UUID
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}
