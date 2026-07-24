import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend } from 'k6/metrics';

// Custom metrics
const loginDuration = new Trend('login_duration');
const authenticatedRequestDuration = new Trend('authenticated_request_duration');

// Configuración de entorno
const BASE_URL = __ENV.API_GATEWAY_URL || 'http://localhost:3000';
const USER_EMAIL = __ENV.TEST_USER_EMAIL || 'admin@admin.com';
const USER_PASSWORD = __ENV.TEST_USER_PASSWORD || 'password123';

export const options = {
  scenarios: {
    smoke_health: {
      executor: 'constant-vus',
      vus: 1,
      duration: '30s',
      exec: 'smokeHealth',
      tags: { scenario: 'smoke_health' }
    },
    load_auth_login: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 50 },
        { duration: '2m', target: 50 },
        { duration: '30s', target: 0 },
      ],
      exec: 'loadAuthLogin',
      tags: { scenario: 'load_auth_login' }
    },
    load_laboratories: {
      executor: 'constant-vus',
      vus: 30,
      duration: '2m',
      exec: 'loadLaboratories',
      tags: { scenario: 'load_laboratories' }
    },
    load_reservations: {
      executor: 'constant-vus',
      vus: 30,
      duration: '2m',
      exec: 'loadReservations',
      tags: { scenario: 'load_reservations' }
    },
    spike_mixed: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '10s', target: 80 },
        { duration: '30s', target: 80 },
        { duration: '10s', target: 10 },
      ],
      exec: 'spikeMixed',
      tags: { scenario: 'spike_mixed' }
    },
  },
  thresholds: {
    'http_req_duration{scenario:smoke_health}': ['p(95)<500'],
    'http_req_failed{scenario:smoke_health}': ['rate<0.01'],
    'http_req_duration{scenario:load_auth_login}': ['p(95)<800'],
    'http_req_failed{scenario:load_auth_login}': ['rate<0.02'],
    'http_req_duration{scenario:load_laboratories}': ['p(95)<600'],
    'http_req_failed{scenario:load_laboratories}': ['rate<0.01'],
    'http_req_duration{scenario:load_reservations}': ['p(95)<600'],
    'http_req_failed{scenario:load_reservations}': ['rate<0.01'],
    'http_req_duration{scenario:spike_mixed}': ['p(99)<2000'],
    'http_req_failed{scenario:spike_mixed}': ['rate<0.05'],
  },
};

export function setup() {
  const loginPayload = JSON.stringify({
    email: USER_EMAIL,
    password: USER_PASSWORD,
  });
  
  const headers = { 'Content-Type': 'application/json' };
  const res = http.post(`${BASE_URL}/api/auth/login`, loginPayload, { headers });
  
  if (res.status !== 200 && res.status !== 201) {
    console.error(`Error de autenticación en setup: ${res.status}`);
    return { token: null };
  }
  
  const token = res.json('accessToken');
  return { token };
}

export function smokeHealth() {
  group('Health Check', () => {
    const res = http.get(`${BASE_URL}/health`, { tags: { scenario: 'smoke_health' } });
    check(res, {
      'status is 200': (r) => r.status === 200,
    });
  });
  sleep(1);
}

export function loadAuthLogin() {
  group('Auth Login', () => {
    const loginPayload = JSON.stringify({
      email: USER_EMAIL,
      password: USER_PASSWORD,
    });
    const headers = { 'Content-Type': 'application/json' };
    const res = http.post(`${BASE_URL}/api/auth/login`, loginPayload, { headers, tags: { scenario: 'load_auth_login' } });
    
    loginDuration.add(res.timings.duration);
    
    check(res, {
      'status is 200 or 201': (r) => r.status === 200 || r.status === 201,
      'has accessToken': (r) => r.json('accessToken') !== undefined,
    });
  });
  sleep(1);
}

export function loadLaboratories(data) {
  if (!data.token) {
    console.error('No token provided to loadLaboratories');
    return;
  }
  
  group('Get Laboratories', () => {
    const headers = {
      'Authorization': `Bearer ${data.token}`,
      'Content-Type': 'application/json',
    };
    
    const res = http.get(`${BASE_URL}/api/laboratories/laboratories`, { headers, tags: { scenario: 'load_laboratories' } });
    
    authenticatedRequestDuration.add(res.timings.duration);
    
    check(res, {
      'status is 200': (r) => r.status === 200,
    });
  });
  sleep(1);
}

export function loadReservations(data) {
  if (!data.token) {
    console.error('No token provided to loadReservations');
    return;
  }
  
  group('Get My Reservations', () => {
    const headers = {
      'Authorization': `Bearer ${data.token}`,
      'Content-Type': 'application/json',
    };
    
    const res = http.get(`${BASE_URL}/api/reservations/my`, { headers, tags: { scenario: 'load_reservations' } });
    
    authenticatedRequestDuration.add(res.timings.duration);
    
    check(res, {
      'status is 200': (r) => r.status === 200,
    });
  });
  sleep(1);
}

export function spikeMixed(data) {
  if (!data.token) {
    console.error('No token provided to spikeMixed');
    return;
  }
  
  group('Mixed Workload', () => {
    const headersAuth = {
      'Authorization': `Bearer ${data.token}`,
      'Content-Type': 'application/json',
    };
    
    const reqs = [
      ['GET', `${BASE_URL}/health`, null, { tags: { scenario: 'spike_mixed' } }],
      ['GET', `${BASE_URL}/api/laboratories/laboratories`, null, { headers: headersAuth, tags: { scenario: 'spike_mixed' } }],
      ['GET', `${BASE_URL}/api/reservations/my`, null, { headers: headersAuth, tags: { scenario: 'spike_mixed' } }]
    ];
    
    const responses = http.batch(reqs);
    
    check(responses[0], { 'health status is 200': (r) => r.status === 200 });
    check(responses[1], { 'labs status is 200': (r) => r.status === 200 });
    check(responses[2], { 'reservations status is 200': (r) => r.status === 200 });
  });
  sleep(1);
}
