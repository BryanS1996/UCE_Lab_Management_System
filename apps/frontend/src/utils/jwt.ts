import { DecodedToken, UserRole } from '../types';

export function decodeJwtPayload(token: string): DecodedToken | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    return JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/'))) as DecodedToken;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload) return true;
  const now = Date.now() / 1000;
  return payload.exp < now;
}

export function mapRole(backendRole: string): UserRole {
  if (!backendRole) return 'ESTUDIANTE';
  const roleName = backendRole.toLowerCase();
  switch (roleName) {
    case 'admin':
      return 'ADMIN';
    case 'professor':
    case 'docente':
      return 'DOCENTE';
    case 'student':
    case 'estudiante':
      return 'ESTUDIANTE';
    case 'lab_manager':
      return 'LAB_MANAGER';
    default:
      return 'ESTUDIANTE';
  }
}
