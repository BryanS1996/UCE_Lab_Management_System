import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { mapRole } from '../utils/jwt';

const TOKEN_KEY = 'uce_access_token';
const REFRESH_KEY = 'uce_refresh_token';

// En producción/QA: VITE_API_GATEWAY_URL debe estar vacío para usar rutas relativas (/api/...)
// que nginx redirige internamente al contenedor api-gateway.
// Solo se usa una URL absoluta en desarrollo local.
const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || '';

export const axiosInstance = axios.create({
  baseURL: API_GATEWAY_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper functions for token management
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);

export const setTokens = (accessToken: string | null, refreshToken?: string | null) => {
  if (accessToken) {
    localStorage.setItem(TOKEN_KEY, accessToken);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }

  if (refreshToken !== undefined) {
    if (refreshToken) {
      localStorage.setItem(REFRESH_KEY, refreshToken);
    } else {
      localStorage.removeItem(REFRESH_KEY);
    }
  }
};

export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
};

// Queue for holding requests while refreshing token
interface FailedRequestQueueItem {
  resolve: (value: string | PromiseLike<string>) => void;
  reject: (reason?: any) => void;
}

let isRefreshing = false;
let failedQueue: FailedRequestQueueItem[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token as string);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach Authorization header
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Auto-refresh tokens on 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Evitar bucles de refresco infinitos y solo reintentar si es 401
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/api/auth/login') &&
      !originalRequest.url?.includes('/api/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearTokens();
        // Redirigir a login si no hay refresh token
        window.dispatchEvent(new Event('auth_logout'));
        return Promise.reject(error);
      }

      try {
        const response = await axios.post<{ accessToken: string; refreshToken: string }>(
          `${API_GATEWAY_URL}/api/auth/refresh`,
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        setTokens(accessToken, newRefreshToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        processQueue(null, accessToken);
        isRefreshing = false;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        isRefreshing = false;
        window.dispatchEvent(new Event('auth_logout'));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
