export type UserRole = 'ADMIN' | 'DOCENTE' | 'ESTUDIANTE' | 'LAB_MANAGER';

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
  role: string; // Puede venir del JWT como 'admin', 'professor', 'student' o 'lab_manager'
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
