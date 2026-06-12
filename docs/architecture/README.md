# Arquitectura — UCE Lab Management System

## Diagrama de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CLIENTE (Angular SPA)                                │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │ HTTPS / WebSocket
                        ┌─────────▼──────────┐
                        │   API Gateway      │  (Próximo Sprint)
                        │   NestJS :3000     │  JWT validation, rate limit
                        └────────┬───────────┘
                                 │ HTTP
        ┌────────────────────────┼───────────────────────────┐
        │                        │                           │
┌───────▼───────┐     ┌──────────▼──────┐        ┌──────────▼──────────┐
│ Auth Service  │     │Reservation Svc  │        │ Laboratory Service  │
│   :3001       │     │   :3002         │        │   :3003             │
│               │     │                 │        │                     │
│ - Registro    │     │ - Crear Reserva │        │ - CRUD Labs         │
│ - Login/JWT   │     │ - Confirmar     │        │ - Recursos          │
│ - Roles       │     │ - Cancelar      │        │ - Trazabilidad      │
│ - Usuarios    │     │ - Disponib.     │        │ - WebSocket status  │
└───────┬───────┘     └──────────┬──────┘        └──────────┬──────────┘
        │                        │ Publica eventos           │ Publica eventos
        │                        ▼                           ▼
┌───────▼──────┐     ┌────────────────────────────────────────────────────┐
│ PostgreSQL   │     │              RabbitMQ (Event Bus)                  │
│ auth_service │     │                                                    │
│              │     │  reservation.events (topic)                        │
└──────────────┘     │    ├── reservation.created                         │
                     │    ├── reservation.confirmed                       │
┌─────────────┐      │    └── reservation.cancelled                       │
│ PostgreSQL  │      │  laboratory.events (topic)                         │
│ reservation │      │    ├── laboratory.created                          │
│ _service    │      │    └── laboratory.updated                          │
└─────────────┘      └───────────────────────┬───────────────────────────┘
                                             │ Consume
┌─────────────┐                    ┌─────────▼──────────┐
│ PostgreSQL  │                    │ Notification Svc   │
│ laboratory  │                    │   :3004            │
│ _service    │                    │                    │
└─────────────┘                    │ - Consume eventos  │
                                   │ - Push WebSocket   │
┌─────────────┐                    │ - Persiste notif.  │
│ PostgreSQL  │◄──────────────────►│                    │
│ notif_svc   │                    └────────────────────┘
└─────────────┘
```

## Microservicios Sprint Actual

| Servicio | Puerto | BD | Responsabilidad |
|---------|--------|-----|-----------------|
| Auth Service | 3001 | PostgreSQL | Autenticación, JWT, Roles |
| Reservation Service | 3002 | PostgreSQL | Reservas de laboratorio |
| Laboratory Service | 3003 | PostgreSQL | Gestión de labs y recursos |
| Notification Service | 3004 | PostgreSQL | Notificaciones (RabbitMQ + WS) |

## Flujo de Trazabilidad

Cada operación de escritura en los servicios registra:
- `user_id` del JWT → `created_by` / `updated_by`
- `timestamp` automático
- Versioning optimista (`@VersionColumn`)

## Comunicación Entre Servicios

- **Síncrona:** HTTP REST (dentro del cluster)
- **Asíncrona:** RabbitMQ topic exchange (EDA)
- **Tiempo real:** WebSocket (Socket.IO namespace `/notifications`)

## GitOps

```
main → Deploy Producción (EC2)
  └── PR requiere: tests passing + terraform plan OK

qa → Deploy QA (EC2)
  └── PR requiere: tests passing

feature/* → Desarrollo
  └── CI: lint + unit tests
```
