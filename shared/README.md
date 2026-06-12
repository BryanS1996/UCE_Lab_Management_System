# Shared Library — UCE Lab Management System

Biblioteca compartida entre todos los microservicios del monorepo.

## Contenido

| Directorio | Descripción |
|------------|-------------|
| `events/` | Clases de eventos de dominio tipados (EDA con RabbitMQ) |
| `enums/` | Enumeraciones compartidas (ReservationStatus, UserRole, etc.) |
| `interfaces/` | Interfaces TypeScript comunes (JwtPayload, ServiceResponse, etc.) |
| `constants/` | Constantes de RabbitMQ (exchanges, routing keys, queues) |
| `dto/` | DTOs base compartidos (pendiente) |
| `types/` | Tipos TypeScript utilitarios (pendiente) |
| `utils/` | Funciones utilitarias compartidas (pendiente) |

## Uso en los servicios

Cada servicio referencia este directorio directamente:

```typescript
import { ReservationCreatedEvent, RABBITMQ_EXCHANGES } from '../../shared';
```

## Eventos de Dominio

```
ReservationCreated   → reservation.created   → notification-service, audit-service, analytics-service
ReservationConfirmed → reservation.confirmed → notification-service, audit-service
ReservationCancelled → reservation.cancelled → notification-service, audit-service
LaboratoryCreated    → laboratory.created    → audit-service
NotificationSent     → notification.sent     → audit-service
```
