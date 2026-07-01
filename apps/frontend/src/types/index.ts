export type UserRole = 'ADMIN' | 'DOCENTE' | 'ESTUDIANTE';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive?: boolean;
}

export interface DecodedToken {
  sub: string;
  email: string;
  role?: string;
  roles?: string[];
  exp: number;
  iat: number;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: Array<{ id: string; name: string; description: string }>;
  };
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}
