import { services } from './config';
import {
  clearTokens,
  decodeJwtPayload,
  endpoints,
  getRefreshToken,
  getToken,
  getTokenExpiry,
  setTokens,
} from './api';

const app = document.getElementById('app')!;

function renderResult(el: HTMLElement, data: unknown, error?: unknown) {
  if (error) {
    el.innerHTML = `<pre class="status-err">${JSON.stringify(error, null, 2)}</pre>`;
    return;
  }
  el.innerHTML = `<pre class="status-ok">${JSON.stringify(data, null, 2)}</pre>`;
}

async function run(
  el: HTMLElement,
  fn: () => Promise<unknown>,
) {
  el.innerHTML = '<pre>Cargando...</pre>';
  try {
    renderResult(el, await fn());
  } catch (err) {
    renderResult(el, null, err);
  }
}

app.innerHTML = `
  <header>
    <h1>UCE Lab Management — Panel de pruebas</h1>
    <p>
      Auth :3000 · Reservation :3001 · Laboratory :3002 · Notification :3003
      &nbsp;|&nbsp; QA: <code>?env=qa</code> → :3010–3013
    </p>
  </header>
  <main>
    <section class="card">
      <h2>Autenticación <span class="badge">${services.auth}</span></h2>
      <div class="grid-2">
        <div>
          <h3 style="font-size:0.9rem;margin:0 0 0.5rem">Login</h3>
          <label>Email</label>
          <input id="login-email" type="email" value="student@uce.edu.ec" />
          <label>Contraseña</label>
          <input id="login-pass" type="password" value="Test1234!" />
          <div class="actions">
            <button id="btn-login">Iniciar sesión</button>
            <button id="btn-logout" class="secondary">Cerrar sesión</button>
          </div>
        </div>
        <div>
          <h3 style="font-size:0.9rem;margin:0 0 0.5rem">Registro rápido</h3>
          <label>Email</label>
          <input id="reg-email" type="email" placeholder="nuevo@uce.edu.ec" />
          <label>Nombre / Apellido</label>
          <input id="reg-first" placeholder="Juan" />
          <input id="reg-last" placeholder="Pérez" />
          <label>Contraseña (mayús, minús, número, especial)</label>
          <input id="reg-pass" type="password" placeholder="Test1234!" />
          <div class="actions">
            <button id="btn-register" class="secondary">Registrar</button>
          </div>
        </div>
      </div>
      <div class="actions" style="margin-top:0.75rem">
        <button id="btn-refresh" class="secondary">Renovar access token</button>
      </div>
      <div id="auth-result"></div>
      <div id="jwt-payload" class="hint"></div>
      <div id="refresh-info" class="hint"></div>
    </section>

    <section class="card">
      <h2>Health checks</h2>
      <div class="actions">
        <button data-health="auth">Auth /health</button>
        <button data-health="reservation">Reservation /health</button>
        <button data-health="laboratory">Laboratory /health</button>
        <button data-health="notification">Notification /health</button>
      </div>
      <div id="health-result"></div>
    </section>

    <section class="card">
      <h2>Endpoints protegidos <span class="badge">Bearer JWT + auto-refresh</span></h2>
      <p class="hint">Si el access token expiró (15m), se renueva automáticamente con el refresh token.</p>
      <div class="actions">
        <button data-api="authMe">GET /auth/me</button>
        <button data-api="reservationMy">GET /reservations/my</button>
        <button data-api="reservationLabs">GET /laboratories (reservation)</button>
        <button data-api="laboratoryList">GET /laboratories (lab svc)</button>
        <button data-api="notificationMy">GET /notifications/my</button>
        <button data-api="notificationUnread">GET /notifications/my/unread-count</button>
      </div>
      <div id="api-result"></div>
    </section>
  </main>
`;

const authResult = document.getElementById('auth-result')!;
const jwtPayloadEl = document.getElementById('jwt-payload')!;
const refreshInfoEl = document.getElementById('refresh-info')!;
const healthResult = document.getElementById('health-result')!;
const apiResult = document.getElementById('api-result')!;

function storeAuthResponse(data: {
  accessToken: string;
  refreshToken?: string;
}) {
  setTokens(data.accessToken, data.refreshToken ?? getRefreshToken());
  refreshTokenDisplay();
}

function refreshTokenDisplay() {
  const access = getToken();
  const refresh = getRefreshToken();

  if (!access) {
    jwtPayloadEl.textContent = 'Sin access token activo.';
    refreshInfoEl.textContent = refresh
      ? 'Hay refresh token guardado pero no access token.'
      : '';
    return;
  }

  const payload = decodeJwtPayload(access);
  const expiry = getTokenExpiry(access);
  jwtPayloadEl.innerHTML = payload
    ? `<strong>Access JWT:</strong> <code>${JSON.stringify(payload)}</code>`
    : 'No se pudo decodificar el access token.';

  const expiryText = expiry
    ? `Expira: ${expiry.toLocaleString()}`
    : 'Sin exp';
  const refreshPreview = refresh
    ? `${refresh.slice(0, 20)}…${refresh.slice(-10)}`
    : 'ninguno';
  refreshInfoEl.innerHTML = `<strong>Refresh token:</strong> ${refreshPreview} &nbsp;|&nbsp; ${expiryText}`;
}

refreshTokenDisplay();

document.getElementById('btn-login')!.addEventListener('click', async () => {
  const email = (document.getElementById('login-email') as HTMLInputElement).value;
  const password = (document.getElementById('login-pass') as HTMLInputElement).value;
  await run(authResult, async () => {
    const data = (await endpoints.authLogin(email, password)) as {
      accessToken: string;
      refreshToken: string;
      user: unknown;
    };
    storeAuthResponse(data);
    return data;
  });
});

document.getElementById('btn-logout')!.addEventListener('click', () => {
  clearTokens();
  authResult.innerHTML = '<pre>Sesión cerrada.</pre>';
  refreshTokenDisplay();
});

document.getElementById('btn-register')!.addEventListener('click', async () => {
  const body = {
    email: (document.getElementById('reg-email') as HTMLInputElement).value,
    firstName: (document.getElementById('reg-first') as HTMLInputElement).value,
    lastName: (document.getElementById('reg-last') as HTMLInputElement).value,
    password: (document.getElementById('reg-pass') as HTMLInputElement).value,
  };
  await run(authResult, async () => {
    const data = (await endpoints.authRegister(body)) as {
      accessToken: string;
      refreshToken: string;
    };
    storeAuthResponse(data);
    return data;
  });
});

document.getElementById('btn-refresh')!.addEventListener('click', async () => {
  await run(authResult, async () => {
    const newAccess = await endpoints.authRefresh();
    if (!newAccess) {
      throw { status: 401, data: 'Refresh token inválido o expirado' };
    }
    refreshTokenDisplay();
    return {
      message: 'Access token renovado',
      accessTokenPreview: `${newAccess.slice(0, 24)}…`,
      payload: decodeJwtPayload(newAccess),
    };
  });
});

const healthFns: Record<string, () => Promise<unknown>> = {
  auth: endpoints.authHealth,
  reservation: endpoints.reservationHealth,
  laboratory: endpoints.laboratoryHealth,
  notification: endpoints.notificationHealth,
};

document.querySelectorAll('[data-health]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const key = (btn as HTMLElement).dataset.health!;
    run(healthResult, healthFns[key]);
  });
});

const apiFns: Record<string, () => Promise<unknown>> = {
  authMe: endpoints.authMe,
  reservationMy: endpoints.reservationMy,
  reservationLabs: endpoints.reservationLabs,
  laboratoryList: endpoints.laboratoryList,
  notificationMy: endpoints.notificationMy,
  notificationUnread: endpoints.notificationUnread,
};

document.querySelectorAll('[data-api]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const key = (btn as HTMLElement).dataset.api!;
    run(apiResult, async () => {
      const result = await apiFns[key]();
      refreshTokenDisplay();
      return result;
    });
  });
});
