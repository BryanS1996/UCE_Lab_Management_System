# Logger Service

## Overview
The **Logger Service** provides a centralized auditing and logging mechanism for the entire UCE Lab Management System. In a distributed microservices environment, it is crucial to aggregate logs from all services to maintain an immutable audit trail and facilitate debugging.

## Architecture & Responsibilities
- **Log Aggregation**: Consumes asynchronous events from RabbitMQ sent by other microservices.
- **Traceability**: Uses the `x-correlation-id` passed through the system to tie together disparate logs into a single coherent transaction flow.
- **Immutable Audit Trail**: Stores critical operational logs (e.g., failed reservations, payment failures, security alerts) in a secure, append-only manner.

## Tech Stack
- **Framework**: NestJS
- **Database**: Usually a time-series or document database like MongoDB or Elasticsearch (configurable).
- **Message Broker**: RabbitMQ
- **Language**: TypeScript

## Prerequisites
- Node.js (v18 or higher)
- RabbitMQ server

## Environment Variables
Create a `.env` file in the root of this service:
```env
PORT=3013
NODE_ENV=development

# RabbitMQ Integration
RABBITMQ_URL=amqp://user:password@localhost:5672

# Database / Storage
LOG_STORAGE_URI=mongodb://localhost:27017/logs
```

## Running the Service

### Locally (Development)
```bash
# Install dependencies
npm install

# Start in watch mode
npm run start:dev
```

### Via Docker Compose
```bash
docker compose up logger-service rabbitmq -d
```
