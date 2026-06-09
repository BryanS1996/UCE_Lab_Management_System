# Frontend — Panel de pruebas UCE Lab

SPA ligera (Vite + TypeScript) para probar los 4 microservicios.

## Requisitos

- Microservicios corriendo (`docker compose up` o por servicio)
- Mismo `JWT_SECRET` en todos los servicios

## Iniciar

```bash
cd apps/frontend
npm install
npm run dev
```

Abre http://localhost:4200

## Ambiente QA (puertos 3010–3013)

http://localhost:4200?env=qa

## Qué puedes probar

| Sección | Endpoints |
|---------|-----------|
| Auth | Login, registro, refresh token manual, auto-renovación en 401, JWT decodificado |
| Health | `/health` de cada microservicio |
| Protegidos | `/auth/me`, reservas, laboratorios, notificaciones |
