# Reservation Service

## Overview
The **Reservation Service** is the core business engine of the UCE Lab Management System. It manages the scheduling, booking, and time-conflict resolution for all laboratories and equipment listed in the Catalog Service. 

It implements a state machine for bookings (Pending, Confirmed, Cancelled) and relies on the Transactional Outbox pattern to guarantee event delivery across the microservices landscape.

## Architecture & Responsibilities
- **Booking Engine**: Validates time slots, checks for overlaps, and reserves capacity.
- **State Machine**: Transitions reservation statuses based on payment confirmations or manual approvals.
- **Transactional Outbox**: Ensures that when a reservation is saved to the PostgreSQL database, a domain event is reliably published to RabbitMQ (preventing dual-write failures).
- **Database**: Uses **PostgreSQL** to maintain relational integrity for schedules.

## Tech Stack
- **Framework**: NestJS
- **Database ORM**: TypeORM (PostgreSQL)
- **Message Broker**: RabbitMQ
- **Pattern**: Transactional Outbox
- **Language**: TypeScript

## Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- RabbitMQ server

## Environment Variables
Create a `.env` file in the root of this service:
```env
PORT=3003
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=reservation_user
DB_PASS=secure_password
DB_NAME=reservation_db

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
docker compose up reservation-service reservation-db rabbitmq -d
```

## Available Endpoints
- `POST /reservations` - Create a new booking
- `GET /reservations` - List bookings for a user
- `PATCH /reservations/:id/cancel` - Cancel a booking
