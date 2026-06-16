# API Gateway

API Gateway for the UCE Lab Management System. Single entry point for all microservices with routing and JWT validation.

## Overview

The API Gateway serves as the single entry point for all client requests, routing them to the appropriate microservices. It handles request routing, JWT validation, and provides a unified interface for the frontend.

## Technology Stack

- **Framework**: NestJS 11
- **Language**: TypeScript
- **HTTP Client**: Axios (via @nestjs/axios)
- **Configuration**: @nestjs/config
- **Validation**: class-validator

## Architecture

### Directory Structure

```
src/
├── main.ts                    # Application entry point
├── app.module.ts              # Main module
├── app.controller.ts          # Health check endpoint
├── app.service.ts             # Global services
└── modules/
    ├── auth/                  # Auth service routing
    │   ├── auth.module.ts
    │   ├── auth.controller.ts
    │   └── auth.service.ts
    ├── laboratory/            # Laboratory service routing
    │   ├── laboratory.module.ts
    │   ├── laboratory.controller.ts
    │   └── laboratory.service.ts
    ├── reservation/           # Reservation service routing
    │   ├── reservation.module.ts
    │   ├── reservation.controller.ts
    │   └── reservation.service.ts
    └── notification/          # Notification service routing
        ├── notification.module.ts
        ├── notification.controller.ts
        └── notification.service.ts
```

## Routing Configuration

The API Gateway routes requests to the appropriate microservices:

```
/api/auth/*         → auth-service:3010
/api/laboratories/* → laboratory-service:3012
/api/reservations/* → reservation-service:3011
/api/notifications/* → notification-service:3013
```

## API Endpoints

### Health Check
- **GET** `/health` - Service health status

### Auth Routes
- **POST** `/api/auth/register` - User registration
- **POST** `/api/auth/login` - User login
- **POST** `/api/auth/refresh` - Refresh access token
- **GET** `/api/auth/me` - Get current user
- **PATCH** `/api/auth/change-password` - Change password

### Laboratory Routes
- **GET** `/api/laboratories` - Get all laboratories
- **GET** `/api/laboratories/:lab_id` - Get specific laboratory
- **POST** `/api/laboratories` - Create laboratory (admin)
- **PATCH** `/api/laboratories/:lab_id` - Update laboratory (admin)
- **DELETE** `/api/laboratories/:lab_id` - Delete laboratory (admin)

### Reservation Routes
- **GET** `/api/reservations/my` - Get user's reservations
- **GET** `/api/reservations/:id` - Get specific reservation
- **POST** `/api/reservations` - Create reservation
- **PATCH** `/api/reservations/:id` - Update reservation
- **DELETE** `/api/reservations/:id` - Cancel reservation

### Notification Routes
- **GET** `/api/notifications` - Get user notifications
- **GET** `/api/notifications/unread-count` - Get unread count
- **PATCH** `/api/notifications/:id/read` - Mark as read
- **PATCH** `/api/notifications/read-all` - Mark all as read

## Environment Variables

Required environment variables:

```env
PORT=3000
NODE_ENV=qa
AUTH_SERVICE_URL=http://auth-service-qa:3010
LABORATORY_SERVICE_URL=http://laboratory-service-qa:3012
RESERVATION_SERVICE_URL=http://reservation-service-qa:3011
NOTIFICATION_SERVICE_URL=http://notification-service-qa:3013
JWT_SECRET=qa-secret-key-change-in-production
CORS_ORIGIN=*
```

## Development

### Prerequisites
- Node.js 18+
- Docker & Docker Compose

### Installation

```bash
cd services/api-gateway
npm install
```

### Running Locally

```bash
# Development mode with hot-reload
npm run start:dev

# Build for production
npm run build

# Production mode
npm run start:prod
```

### Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Docker Deployment

The service runs automatically with Docker Compose from the project root:

```bash
docker-compose -f docker-compose.qa.yml up -d api-gateway-qa
```

## Communication with Other Services

The API Gateway communicates with backend services through HTTP:

1. **Auth Service**: Handles authentication and user management
2. **Laboratory Service**: Manages laboratory information
3. **Reservation Service**: Handles reservation operations
4. **Notification Service**: Manages notifications

All requests are proxied with the Authorization header passed through for JWT validation by the target services.

## Request Flow

```
Frontend (React)
    ↓
API Gateway (Port 3000)
    ↓
Routes to appropriate service:
    ├── /api/auth/* → Auth Service (3010)
    ├── /api/laboratories/* → Laboratory Service (3012)
    ├── /api/reservations/* → Reservation Service (3011)
    └── /api/notifications/* → Notification Service (3013)
```

## Future Enhancements

- Rate limiting with Redis
- Request/response caching
- API versioning
- Request logging and monitoring
- Circuit breaker pattern
- Load balancing
- WebSocket support for real-time features
- API key authentication
- Request transformation
- Response aggregation
