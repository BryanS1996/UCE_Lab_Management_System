# Frontend Angular — UCE Lab Management

**Framework:** Angular 18 + Angular Material + RxJS

## Estructura

```
src/app/
  core/         ← Guards, interceptors, servicios globales, NgRx store
  shared/       ← Componentes, directivas, pipes reutilizables
  features/
    auth/           ← Login, registro
    dashboard/      ← Panel principal
    reservations/   ← CRUD de reservas
    laboratories/   ← Vista de laboratorios
    notifications/  ← Notificaciones en tiempo real (WebSocket)
    incidents/      ← Reporte de incidentes
    analytics/      ← Reportes y gráficas
```

## Estado

Pendiente de implementación. Inicializar con:

```bash
ng new frontend --directory ./apps/frontend --routing --style scss
cd apps/frontend
ng add @angular/material
```

## Conexión a servicios

| Servicio | URL (Dev) |
|----------|----------|
| API Gateway / Auth | http://localhost:3000 |
| Reservation Service | http://localhost:3001 |
| Laboratory Service | http://localhost:3002 |
| Notification WS | ws://localhost:3003/notifications |
