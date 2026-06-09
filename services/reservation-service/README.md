# Reservation Service

Microservicio de gestión de reservas para el Sistema de Gestión de Laboratorios Universitarios (UCE Lab Management System).

## Características

- ✅ CRUD completo de reservas
- ✅ Validación de conflictos de horarios
- ✅ Control de versión optimista (contra race conditions)
- ✅ Validación de datos con class-validator
- ✅ DTOs con type-safety
- ✅ Arquitectura modular y escalable
- ✅ Preparado para integración con RabbitMQ
- ✅ Dockerizado para producción

## Estructura del Proyecto

```
src/
├── app.controller.ts          # Health check endpoint
├── app.module.ts              # Módulo principal con TypeORM
├── app.service.ts             # Servicios globales
├── main.ts                    # Punto de entrada
├── database/
│   └── entities/
│       ├── reservation.entity.ts    # Entidad Reservation
│       ├── laboratory.entity.ts     # Entidad Laboratory (referencia)
│       └── index.ts
├── reservations/
│   ├── dto/
│   │   ├── create-reservation.dto.ts
│   │   ├── update-reservation.dto.ts
│   │   └── index.ts
│   ├── reservations.controller.ts   # REST endpoints
│   ├── reservations.service.ts      # Lógica de negocio
│   └── reservations.module.ts       # Módulo de reservas
```

## Requisitos Previos

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 15+ (o usar docker-compose)


## Instalación Local

### 1. Instalar dependencias

```bash
cd services/reservation-service
npm install
```

### 2. Crear archivo .env

```bash
cp .env.example .env
```

```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=authuser
DB_PASSWORD=authpassword
DB_NAME=reservation_service
JWT_SECRET=your-secret-key-change-in-production
CORS_ORIGIN=http://localhost:3000
```

### 3. Ejecutar en desarrollo

```bash
npm run start:dev
```

La API estará disponible en `http://localhost:3001`

## Estructura de la Base de Datos

### Tabla: reservations

| Campo | Tipo | Descripción |
|-------|------|-------------|
| reservation_id | UUID (PK) | ID único de la reserva |
| laboratory_id | UUID (FK) | ID del laboratorio |
| user_id | UUID (FK) | ID del usuario |
| start_time | TIMESTAMP | Hora de inicio |
| end_time | TIMESTAMP | Hora de finalización |
| purpose | VARCHAR(500) | Propósito de la reserva |
| status | ENUM | PENDING \| CONFIRMED \| CANCELLED |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Fecha de actualización |
| version | INT | Versión (control optimista) |

### Tabla: laboratories

| Campo | Tipo | Descripción |
|-------|------|-------------|
| laboratory_id | UUID (PK) | ID único del laboratorio |
| name | VARCHAR(255) | Nombre del laboratorio |
| max_capacity | INT | Capacidad máxima |
| is_active | BOOLEAN | Estado activo/inactivo |

## Endpoints REST

### 1. Crear una reserva

**POST** `/reservations`

```json
{
  "laboratory_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "550e8400-e29b-41d4-a716-446655440001",
  "start_time": "2026-06-15T09:00:00Z",
  "end_time": "2026-06-15T11:00:00Z",
  "purpose": "Práctica de Programación en Python"
}
```

**Response:** 201 Created

```json
{
  "reservation_id": "550e8400-e29b-41d4-a716-446655440002",
  "laboratory_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "550e8400-e29b-41d4-a716-446655440001",
  "start_time": "2026-06-15T09:00:00.000Z",
  "end_time": "2026-06-15T11:00:00.000Z",
  "purpose": "Práctica de Programación en Python",
  "status": "PENDING",
  "created_at": "2026-06-02T05:15:00.000Z",
  "updated_at": "2026-06-02T05:15:00.000Z",
  "version": 1
}
```

### 2. Obtener todas las reservas

**GET** `/reservations`

Parámetros de query (opcionales):
- `laboratory_id` (UUID)
- `user_id` (UUID)
- `status` (PENDING | CONFIRMED | CANCELLED)

**Ejemplos:**

```bash
# Todas las reservas
GET /reservations

# Reservas de un laboratorio específico
GET /reservations?laboratory_id=550e8400-e29b-41d4-a716-446655440000

# Reservas pendientes de un usuario
GET /reservations?user_id=550e8400-e29b-41d4-a716-446655440001&status=PENDING

# Reservas confirmadas
GET /reservations?status=CONFIRMED
```

**Response:** 200 OK

```json
[
  {
    "reservation_id": "550e8400-e29b-41d4-a716-446655440002",
    "laboratory_id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "550e8400-e29b-41d4-a716-446655440001",
    "start_time": "2026-06-15T09:00:00.000Z",
    "end_time": "2026-06-15T11:00:00.000Z",
    "purpose": "Práctica de Programación en Python",
    "status": "PENDING",
    "created_at": "2026-06-02T05:15:00.000Z",
    "updated_at": "2026-06-02T05:15:00.000Z",
    "version": 1
  }
]
```

### 3. Obtener una reserva por ID

**GET** `/reservations/{reservation_id}`

**Response:** 200 OK

```json
{
  "reservation_id": "550e8400-e29b-41d4-a716-446655440002",
  "laboratory_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "550e8400-e29b-41d4-a716-446655440001",
  "start_time": "2026-06-15T09:00:00.000Z",
  "end_time": "2026-06-15T11:00:00.000Z",
  "purpose": "Práctica de Programación en Python",
  "status": "PENDING",
  "created_at": "2026-06-02T05:15:00.000Z",
  "updated_at": "2026-06-02T05:15:00.000Z",
  "version": 1
}
```

### 4. Actualizar una reserva

**PATCH** `/reservations/{reservation_id}`

```json
{
  "purpose": "Práctica de Programación en Java",
  "status": "CONFIRMED"
}
```

**Response:** 200 OK

```json
{
  "reservation_id": "550e8400-e29b-41d4-a716-446655440002",
  "laboratory_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "550e8400-e29b-41d4-a716-446655440001",
  "start_time": "2026-06-15T09:00:00.000Z",
  "end_time": "2026-06-15T11:00:00.000Z",
  "purpose": "Práctica de Programación en Java",
  "status": "CONFIRMED",
  "created_at": "2026-06-02T05:15:00.000Z",
  "updated_at": "2026-06-02T05:16:00.000Z",
  "version": 2
}
```

### 5. Cancelar una reserva

**DELETE** `/reservations/{reservation_id}`

**Response:** 200 OK

```json
{
  "reservation_id": "550e8400-e29b-41d4-a716-446655440002",
  "laboratory_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "550e8400-e29b-41d4-a716-446655440001",
  "start_time": "2026-06-15T09:00:00.000Z",
  "end_time": "2026-06-15T11:00:00.000Z",
  "purpose": "Práctica de Programación en Java",
  "status": "CANCELLED",
  "created_at": "2026-06-02T05:15:00.000Z",
  "updated_at": "2026-06-02T05:17:00.000Z",
  "version": 3
}
```

### 6. Confirmar una reserva (Cambiar estado PENDING → CONFIRMED)

**PATCH** `/reservations/{reservation_id}/confirm`

**Response:** 200 OK

```json
{
  "reservation_id": "550e8400-e29b-41d4-a716-446655440002",
  "laboratory_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "550e8400-e29b-41d4-a716-446655440001",
  "start_time": "2026-06-15T09:00:00.000Z",
  "end_time": "2026-06-15T11:00:00.000Z",
  "purpose": "Práctica de Programación en Java",
  "status": "CONFIRMED",
  "created_at": "2026-06-02T05:15:00.000Z",
  "updated_at": "2026-06-02T05:18:00.000Z",
  "version": 4
}
```

## Ejemplos con cURL

### 1. Crear una reserva

```bash
curl -X POST http://localhost:3001/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "laboratory_id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "550e8400-e29b-41d4-a716-446655440001",
    "start_time": "2026-06-15T09:00:00Z",
    "end_time": "2026-06-15T11:00:00Z",
    "purpose": "Práctica de Programación en Python"
  }'
```

### 2. Obtener todas las reservas

```bash
curl http://localhost:3001/reservations
```

### 3. Obtener reservas de un usuario

```bash
curl "http://localhost:3001/reservations?user_id=550e8400-e29b-41d4-a716-446655440001"
```

### 4. Obtener una reserva específica

```bash
curl http://localhost:3001/reservations/550e8400-e29b-41d4-a716-446655440002
```

### 5. Actualizar una reserva

```bash
curl -X PATCH http://localhost:3001/reservations/550e8400-e29b-41d4-a716-446655440002 \
  -H "Content-Type: application/json" \
  -d '{
    "purpose": "Práctica de Programación en Java",
    "status": "CONFIRMED"
  }'
```

### 6. Cancelar una reserva

```bash
curl -X DELETE http://localhost:3001/reservations/550e8400-e29b-41d4-a716-446655440002
```

### 7. Confirmar una reserva

```bash
curl -X PATCH http://localhost:3001/reservations/550e8400-e29b-41d4-a716-446655440002/confirm
```

## Ejemplos con Postman

### Importar Collection

1. Abre Postman
2. Click en **Import**
3. Selecciona **Link**
4. Pega esta URL (crea la colección manualmente con los endpoints anteriores)

### Variables de Entorno en Postman

```json
{
  "base_url": "http://localhost:3001",
  "lab_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "550e8400-e29b-41d4-a716-446655440001",
  "reservation_id": ""
}
```

### Crear Solicitud POST - Crear Reserva

```
POST {{base_url}}/reservations
Content-Type: application/json

{
  "laboratory_id": "{{lab_id}}",
  "user_id": "{{user_id}}",
  "start_time": "2026-06-15T09:00:00Z",
  "end_time": "2026-06-15T11:00:00Z",
  "purpose": "Práctica de Laboratorio"
}
```

## Docker Compose Integration

El servicio se levanta automáticamente con docker-compose:

```bash
cd /path/to/UCE_Lab_Management_System
docker-compose up --build
```

Se ejecutará en:
- **Puerto API:** 3001
- **Base de datos:** PostgreSQL (host: reservation-db, puerto: 5432)

## Validaciones Implementadas

### CreateReservationDto
- ✅ `laboratory_id`: UUID requerido
- ✅ `user_id`: UUID requerido
- ✅ `start_time`: Datetime requerido
- ✅ `end_time`: Datetime requerido (debe ser posterior a start_time)
- ✅ `purpose`: String opcional (máx. 500 caracteres)

### Lógica de Negocio
- ✅ Validar que end_time > start_time
- ✅ Detectar conflictos de horarios para el laboratorio
- ✅ Prevenir cambios inválidos de estado
- ✅ Control de concurrencia con versionado

## Estados de Reserva

| Estado | Descripción |
|--------|-------------|
| PENDING | Reserva creada, pendiente de confirmación |
| CONFIRMED | Reserva confirmada |
| CANCELLED | Reserva cancelada |

## Códigos de Error HTTP

| Código | Descripción |
|--------|-------------|
| 201 | Creado exitosamente |
| 200 | Operación exitosa |
| 400 | Solicitud inválida (validación fallida) |
| 404 | Recurso no encontrado |
| 500 | Error interno del servidor |

## Preparación para Integración Futura

El servicio está preparado para:

- **RabbitMQ:** Los comentarios `TODO` indican dónde publicar eventos
  - `ReservationCreatedEvent`
  - `ReservationUpdatedEvent`
  - `ReservationCancelledEvent`
  - `ReservationConfirmedEvent`

- **API Gateway:** Todos los endpoints están listos para ser consumidos por el API Gateway

- **Autenticación JWT:** El servicio acepta tokens JWT (implementar guards cuando se integre)

- **Otros Microservicios:**
  - Payment Service (para pagos de laboratorios premium)
  - Audit Service (para registrar cambios)
  - Laboratory Service (para validar disponibilidad)

## Desarrollo Futuro

- [ ] Integrar RabbitMQ para publicación de eventos
- [ ] Implementar guards JWT para autenticación
- [ ] Agregar caching con Redis
- [ ] Implementar paginación en listados
- [ ] Agregar más filtros avanzados
- [ ] Validación de disponibilidad de laboratorio en tiempo real
- [ ] Tests unitarios e integración

## Scripts Útiles

```bash
# Formatear código
npm run format

# Lint
npm run lint

# Build
npm run build

# Tests (cuando se implementen)
npm run test
npm run test:e2e
```

## Tecnologías

- **NestJS 11.0** - Framework
- **TypeORM 0.3** - ORM
- **PostgreSQL 15** - Base de datos
- **class-validator** - Validación
- **class-transformer** - Transformación de datos
- **Passport & JWT** - Autenticación (preparado)
- **Docker** - Containerización

## Autor

Sistema de Gestión de Laboratorios - UCE

## Licencia

UNLICENSED
