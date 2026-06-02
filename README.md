# UCE Lab Management System — Microservicios

**Proyecto Final — Programación Distribuida**  
**Estudiante:** Bryan Suárez  
**Universidad:** Universidad Central del Ecuador (UCE)

---

## Descripción General

Sistema distribuido de gestión de laboratorios universitarios basado en **microservicios con NestJS**, arquitectura **Event-Driven (EDA)** con RabbitMQ, persistencia políglota y despliegue en contenedores Docker.

---

## Microservicios Implementados

### 1. Auth Service (`/services/auth-service`) — Puerto 3000 (Prod) / 3010 (QA)

**Responsabilidad:** Gestión completa de identidad y autenticación.

| Aspecto | Detalle |
|---------|---------|
| Framework | NestJS 11 + TypeScript |
| Base de datos | PostgreSQL 15 (TypeORM) |
| Autenticación | JWT (access 15min + refresh 7d) |
| Seguridad | bcrypt (hash de contraseñas) |
| Documentación | Swagger UI → `/api/docs` |

**Endpoints principales:**

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/auth/register` | Registrar usuario |
| `POST` | `/auth/login` | Iniciar sesión → JWT |
| `GET` | `/auth/me` | Usuario autenticado 🔒 |
| `POST` | `/auth/change-password` | Cambiar contraseña 🔒 |
| `GET` | `/users` | Listar usuarios 🔒 |
| `GET` | `/users/:id` | Obtener usuario 🔒 |

---

### 2. Reservation Service (`/services/reservation-service`) — Puerto 3001 (Prod) / 3011 (QA)

**Responsabilidad:** Gestión de laboratorios y reservas con comunicación asíncrona.

| Aspecto | Detalle |
|---------|---------|
| Framework | NestJS 11 + TypeScript |
| Base de datos | PostgreSQL 15 (TypeORM, BD independiente) |
| Mensajería | RabbitMQ (topic exchange `reservation.events`) |
| Auth | JWT compartido con Auth Service (RBAC) |
| Documentación | Swagger UI → `/api/docs` |

**Endpoints principales:**

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/laboratories` | Crear laboratorio 🔒 |
| `GET` | `/laboratories` | Listar laboratorios |
| `GET` | `/laboratories/:id` | Obtener laboratorio |
| `GET` | `/laboratories/:id/availability` | Verificar disponibilidad |
| `PATCH` | `/laboratories/:id/toggle` | Activar/desactivar 🔒 |
| `POST` | `/reservations` | Crear reserva 🔒 |
| `GET` | `/reservations/my` | Mis reservas 🔒 |
| `GET` | `/reservations` | Listar reservas 🔒 |
| `GET` | `/reservations/:id` | Ver reserva 🔒 |
| `PATCH` | `/reservations/:id/confirm` | Confirmar (ADMIN) 🔒 |
| `DELETE` | `/reservations/:id` | Cancelar 🔒 |

**Eventos RabbitMQ publicados:**
- `reservation.created` → al crear reserva
- `reservation.confirmed` → al confirmar reserva
- `reservation.cancelled` → al cancelar reserva

---

## Tecnologías Utilizadas

| Categoría | Tecnología |
|-----------|-----------|
| Backend | NestJS 11, TypeScript 5.7 |
| Base de datos | PostgreSQL 15 (TypeORM) |
| Mensajería | RabbitMQ 3.12 + @golevelup/nestjs-rabbitmq |
| Autenticación | JWT, Passport.js, bcrypt |
| Documentación | Swagger / OpenAPI 3.0 |
| Contenedores | Docker + Docker Compose |
| Testing | Jest + ts-jest (25 tests) |
| CI/CD | GitHub Actions |
| Control de versiones | Git / GitHub |

---

## Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE (Postman / Browser)               │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP REST
          ┌─────────────────┴──────────────────┐
          │                                    │
   ┌──────▼──────┐                    ┌────────▼────────┐
   │ Auth Service│                    │Reservation      │
   │  :3000      │  JWT compartido    │Service :3001    │
   │             │◄──────────────────►│                 │
   │ /auth/*     │                    │ /reservations/* │
   │ /users/*    │                    │ /laboratories/* │
   └──────┬──────┘                    └────────┬────────┘
          │                                    │
   ┌──────▼──────┐                    ┌────────▼────────┐
   │ PostgreSQL  │                    │  PostgreSQL     │
   │ auth_service│                    │reservation_svc  │
   │  :5432      │                    │   :5433         │
   └─────────────┘                    └────────┬────────┘
                                               │ Publica eventos
                                      ┌────────▼────────┐
                                      │    RabbitMQ     │
                                      │  :5672 / :15672 │
                                      │ reservation.    │
                                      │   events        │
                                      └─────────────────┘
```

---

## Ambientes

### Desarrollo Local
```bash
docker compose up -d
# Auth Service:        http://localhost:3000
# Auth Swagger:        http://localhost:3000/api/docs
# Reservation Service: http://localhost:3001
# Reservation Swagger: http://localhost:3001/api/docs
# RabbitMQ UI:         http://localhost:15672 (guest/guest)
```

### QA
```bash
docker compose -f docker-compose.qa.yml up -d
# Auth Service QA:        http://localhost:3010
# Auth Swagger QA:        http://localhost:3010/api/docs
# Reservation Service QA: http://localhost:3011
# Reservation Swagger QA: http://localhost:3011/api/docs
# RabbitMQ QA UI:         http://localhost:15673 (guest/guest)
```

| Diferenciación | DEV/PROD | QA |
|----------------|----------|----|
| Puertos | 3000, 3001 | 3010, 3011 |
| Bases de datos | `auth_service`, `reservation_service` | `auth_service_qa`, `reservation_service_qa` |
| NODE_ENV | `production` | `qa` |
| JWT Secret | `your-secret-key-change-in-production` | `qa-secret-key-change-in-production` |
| RabbitMQ | 5672 / 15672 | 5673 / 15673 |

---

## Variables de Entorno

### Auth Service (`.env.example`)
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=authuser
DB_PASSWORD=CHANGE_ME
DB_NAME=auth_service
JWT_SECRET=CHANGE_ME_MIN_32_CHARS
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

### Reservation Service (`.env.example`)
```env
PORT=3001
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=reservationuser
DB_PASSWORD=CHANGE_ME
DB_NAME=reservation_service
DB_SSL=false
JWT_SECRET=CHANGE_ME_MIN_32_CHARS
CORS_ORIGIN=http://localhost:3000
RABBITMQ_URL=amqp://guest:guest@localhost:5672
NODE_ENV=development
```

> ⚠️ **Nunca commites credenciales reales.** Los archivos `.env` están en `.gitignore`.

---

## Ejecutar Tests

```bash
# Reservation Service — 25 tests
cd services/reservation-service
npm run test

# Auth Service
cd services/auth-service
npm run test
```

---

## Estructura del Repositorio

```
UCE_Lab_Management_System/
├── services/
│   ├── auth-service/          # Microservicio 1: Autenticación
│   │   ├── src/
│   │   │   ├── auth/          # Login, registro, JWT
│   │   │   ├── users/         # Gestión de usuarios
│   │   │   └── database/      # Entidades TypeORM
│   │   └── Dockerfile
│   └── reservation-service/   # Microservicio 2: Reservas
│       ├── src/
│       │   ├── common/        # JWT Guard, decorators
│       │   ├── laboratories/  # CRUD + disponibilidad
│       │   ├── reservations/  # Gestión de reservas
│       │   ├── rabbitmq/      # Event publisher (EDA)
│       │   └── health/        # Health check
│       └── Dockerfile
├── docker-compose.yml         # Ambiente DESARROLLO / PRODUCCIÓN
├── docker-compose.qa.yml      # Ambiente QA (puertos diferenciados)
├── .github/
│   └── workflows/
│       └── reservation-service-ci.yml  # CI/CD pipeline
└── README.md
```

---

## CI/CD

El pipeline de GitHub Actions (`feature/reservation-service` y `main`) ejecuta automáticamente:
1. `npm ci` — Instalación de dependencias
2. `npm run build` — Compilación TypeScript
3. `npm run test --coverage` — 25 tests unitarios
4. Upload del reporte de coverage como artifact

---

## Decisiones de Diseño

| Decisión | Justificación |
|----------|---------------|
| BD separadas por servicio | Independencia total, sin acoplamiento de datos |
| JWT compartido (shared secret) | Simplicidad para academia; en producción real se usaría JWKS |
| RabbitMQ topic exchange | Permite múltiples consumidores por routing key |
| `select: false` en password | Nunca se expone el hash en respuestas normales |
| Optimistic Locking (version) | Previene race conditions en actualizaciones concurrentes |
| `user_id` del JWT (no del body) | Seguridad: el cliente no puede falsificar su identidad |
| QueryBuilder + addSelect | Workaround para TypeORM `select: false` al recuperar password |

---

## Problemas Encontrados y Soluciones

| Problema | Causa | Solución |
|----------|-------|---------|
| Login retornaba 401 siempre | TypeORM ignora `select: false` incluso con array `select` | Usar `QueryBuilder` + `.addSelect('user.password')` |
| `@golevelup/nestjs-rabbitmq` v9 incompatible | `reflect-metadata@^0.2.2` requerido, proyecto usa `^0.1.x` | Usar versión 8.x con `--legacy-peer-deps` |
| Tests fallaban con type annotations | Jest sin config ts-jest en reservation-service | Agregar sección `jest` con `ts-jest` transform en `package.json` |
| `forRootAsync` con 2 argumentos | API v8.x usa 1 argumento, v9.x usa 2 | Ajustar a `RabbitMQModule.forRootAsync({...})` (1 arg) |
