export interface ServiceUrls {
  auth: string;
  reservation: string;
  laboratory: string;
  notification: string;
}

const dev: ServiceUrls = {
  auth: 'http://localhost:3000',
  reservation: 'http://localhost:3001',
  laboratory: 'http://localhost:3002',
  notification: 'http://localhost:3003',
};

const qa: ServiceUrls = {
  auth: '/api/auth',
  reservation: '/api/reservations',
  laboratory: '/api/laboratories',
  notification: '/api/notifications',
};

const env = new URLSearchParams(window.location.search).get('env');

export const services: ServiceUrls = env === 'qa' ? qa : dev;
