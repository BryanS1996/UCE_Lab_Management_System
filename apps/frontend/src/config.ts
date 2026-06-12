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
  auth: 'http://localhost:3010',
  reservation: 'http://localhost:3011',
  laboratory: 'http://localhost:3012',
  notification: 'http://localhost:3013',
};

const env = new URLSearchParams(window.location.search).get('env');

export const services: ServiceUrls = env === 'qa' ? qa : dev;
