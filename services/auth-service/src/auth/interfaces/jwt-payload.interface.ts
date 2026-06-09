/**
 * Payload JWT (RFC 7519) — claims incluidos en access/refresh tokens.
 * `iat`, `exp` e `iss` los agrega JwtService via signOptions.
 */
export interface JwtPayload {
  /** Subject — UUID del usuario en PostgreSQL */
  sub: string;
  email: string;
  role: string;
  /** Issuer — "auth-service" (signOptions.issuer) */
  iss?: string;
  /** Issued At — timestamp Unix (automático) */
  iat?: number;
  /** Expiration — timestamp Unix (automático) */
  exp?: number;
}

/** Claims que se firman explícitamente (sin iat/exp/iss) */
export type JwtSigningPayload = Pick<JwtPayload, 'sub' | 'email' | 'role'>;
