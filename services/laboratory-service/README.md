# Laboratory Service

## Overview
The **Laboratory Service** handles the real-time operational state of the physical laboratories. While the `catalog-service` acts as the static menu of what exists, this service manages the day-to-day lifecycle, equipment tracking, and real-time maintenance states based on incident reports.

## Architecture & Responsibilities
- **State Management**: Listens to events (via RabbitMQ) from the Incident Service to automatically lock down or flag equipment/laboratories that require maintenance.
- **Physical Tracking**: Manages the exact physical location, layout, and operational status of lab equipment.
- **Database**: Uses **PostgreSQL** to map the operational data.

## Tech Stack
- **Framework**: NestJS
- **Database ORM**: TypeORM (PostgreSQL)
- **Message Broker**: RabbitMQ
- **Language**: TypeScript

## Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- RabbitMQ server

## Environment Variables
Create a `.env` file in the root of this service:
```env
PORT=3004
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=lab_user
DB_PASS=secure_password
DB_NAME=lab_db

# RabbitMQ Integration
RABBITMQ_URL=amqp://user:password@localhost:5672
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
docker compose up laboratory-service laboratory-db rabbitmq -d
```
