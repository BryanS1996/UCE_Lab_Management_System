import { services } from './config';

const TOKEN_KEY = 'uce_access_token';
const REFRESH_KEY = 'uce_refresh_token';

let refreshInFlight: Promise<string | null> | null = null;


// Forzar siempre rutas relativas para Docker/Nginx
const apiUrls = {
  auth: '/api/auth',
  reservation: '/api/reservations',
  laboratory: '/api/laboratories',
  notification: '/api/notifications',
  incident: '/api/incidents',
  payment: '/api/payments',
};

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(
  access: string | null,
  refresh?: string | null,
): void {
  if (access) localStorage.setItem(TOKEN_KEY, access);
  else localStorage.removeItem(TOKEN_KEY);

  if (refresh !== undefined) {
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
    else localStorage.removeItem(REFRESH_KEY);
  }
}

/** @deprecated Usar setTokens */
export function setToken(token: string | null): void {
  setTokens(token, token ? getRefreshToken() : null);
}

export function clearTokens(): void {
  setTokens(null, null);
}

export function decodeJwtPayload(
  token: string,
): Record<string, unknown> | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    return JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

export function getTokenExpiry(token: string): Date | null {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return null;
  return new Date(payload.exp * 1000);
}

async function requestRefreshToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  const res = await fetch(`${apiUrls.auth}/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: refresh }),
  });

  if (!res.ok) {
    clearTokens();
    return null;
  }

  const data = (await res.json()) as {
    accessToken: string;
    refreshToken: string;
  };
  setTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
}

export async function refreshAccessToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = requestRefreshToken().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

export async function apiFetch(
  base: string,
  path: string,
  options: RequestInit = {},
  retryOn401 = true,
): Promise<unknown> {
  const headers = new Headers(options.headers);
  
  // No establecer application/json si el body es un FormData (subida de archivos)
  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let res = await fetch(`${base}${path}`, { ...options, headers });

  if (res.status === 401 && retryOn401 && getRefreshToken()) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers.set('Authorization', `Bearer ${newToken}`);
      res = await fetch(`${base}${path}`, { ...options, headers });
    }
  }

  const text = await res.text();
  let data: unknown = text;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    /* respuesta no JSON */
  }
  if (!res.ok) {
    throw { status: res.status, data };
  }
  return data;
}

export const endpoints = {
  authHealth: () => apiFetch(apiUrls.auth, '/health'),
  authLogin: (email: string, password: string) =>
    apiFetch(apiUrls.auth, '/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  authRegister: (body: Record<string, string>) =>
    apiFetch(apiUrls.auth, '/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  authRefresh: () => refreshAccessToken(),
  authMe: () => apiFetch(apiUrls.auth, '/me'),
  reservationHealth: () => apiFetch(apiUrls.reservation, '/health'),
  reservationMy: () => apiFetch(apiUrls.reservation, '/my'),
  reservationLabs: () => apiFetch(apiUrls.reservation, '/laboratories'),
  reservationCreate: (body: Record<string, unknown>) =>
    apiFetch(apiUrls.reservation, '/reservations', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  laboratoryHealth: () => apiFetch(apiUrls.laboratory, '/health'),
  laboratoryList: () => apiFetch(apiUrls.laboratory, '/laboratories'),
  notificationHealth: () => apiFetch(apiUrls.notification, '/health'),
  notificationMy: () => apiFetch(apiUrls.notification, '/my'),
  notificationUnread: () =>
    apiFetch(apiUrls.notification, '/my/unread-count'),
  incidentList: () => apiFetch(apiUrls.incident, ''),
  incidentGet: (id: string) => apiFetch(apiUrls.incident, `/${id}`),
  incidentCreate: (formData: FormData) =>
    apiFetch(apiUrls.incident, '', {
      method: 'POST',
      body: formData as any,
    }),
  paymentCheckoutSession: (reservation_id: string, lab_name: string) =>
    apiFetch(apiUrls.payment, '/checkout-session', {
      method: 'POST',
      body: JSON.stringify({ reservation_id, lab_name }),
    }),
};
