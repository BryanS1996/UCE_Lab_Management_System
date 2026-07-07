# API Gateway Service

## Overview
The **API Gateway Service** serves as the single entry point for all client requests (Frontend, Mobile, etc.) to the UCE Lab Management System. It acts as a Backend-For-Frontend (BFF), routing incoming HTTP traffic to the appropriate downstream microservices. 

It is built with [NestJS](https://nestjs.com/) and provides essential cross-cutting concerns such as rate limiting, request validation, authentication routing, and correlation ID injection for distributed tracing.

## Architecture & Responsibilities
- **Routing**: Proxies requests to domain-specific microservices (e.g., Auth, Reservation, Incident).
- **Security**: Can implement rate limiting and coarse-grained authorization checks before traffic hits internal services.
- **Traceability**: Injects an `x-correlation-id` header into every incoming request. This ID is passed along to downstream services and message brokers (RabbitMQ) to trace a transaction across the entire distributed system.
- **Aggregation**: Simplifies the client API by aggregating responses from multiple microservices if needed.

## Tech Stack
- **Framework**: NestJS (Express under the hood)
- **HTTP Client**: `@nestjs/axios` (for proxying requests)
- **Language**: TypeScript

## Prerequisites
- Node.js (v18 or higher)
- Docker & Docker Compose (for running the full local stack)

## Environment Variables
Create a `.env` file in the root of this service (or rely on the global `docker-compose` environment).
```env
PORT=3000
NODE_ENV=development

# Microservices URLs
AUTH_SERVICE_URL=http://localhost:3001
RESERVATION_SERVICE_URL=http://localhost:3003
LABORATORY_SERVICE_URL=http://localhost:3004
INCIDENT_SERVICE_URL=http://localhost:3007
CATALOG_SERVICE_URL=http://localhost:3009
PAYMENT_SERVICE_URL=http://localhost:3008
```

## Running the Service

### Locally (Development)
```bash
# Install dependencies
npm install

# Run in watch mode
npm run start:dev
```

### Via Docker Compose
It is recommended to run this service as part of the overall microservices stack:
```bash
# From the root of the project
docker compose up api-gateway -d
```

## Available Endpoints
This service typically exposes paths that mirror downstream services, for example:
- `POST /api/auth/login` ➔ Routes to Auth Service
- `GET /api/reservations` ➔ Routes to Reservation Service
- `POST /api/incidents` ➔ Routes to Incident Service
