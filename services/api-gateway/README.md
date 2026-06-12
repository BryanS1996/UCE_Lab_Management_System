## API Gateway — UCE Lab Management

**Sprint:** PRÓXIMO

**Responsabilidad:** Punto único de entrada para todos los microservicios. Rate limiting, JWT validation, routing.

**Stack previsto:** NestJS + http-proxy-middleware + Redis (rate limit)

**Puerto:** 3000 (en producción reemplaza al auth-service como puerta de entrada)

**Rutas previstas:**
```
/auth/*         → auth-service:3000
/reservations/* → reservation-service:3001
/laboratories/* → laboratory-service:3002
/notifications/* → notification-service:3003
```

**Estado:** Pendiente de implementación en próximo sprint.
