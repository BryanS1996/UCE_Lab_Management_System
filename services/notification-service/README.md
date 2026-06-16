# Notification Service

Notification management microservice for the UCE Lab Management System.

## Overview

The Notification Service handles real-time notifications for the system. It consumes events from RabbitMQ and delivers notifications to users via WebSocket connections. This service enables instant updates for reservation confirmations, cancellations, and other system events.

## Technology Stack

- **Framework**: NestJS 11
- **Language**: TypeScript
- **Database**: PostgreSQL 15
- **ORM**: TypeORM
- **Message Broker**: RabbitMQ (amqplib)
- **Real-time**: WebSocket (socket.io)
- **Validation**: class-validator

## Architecture

### Directory Structure

```
src/
├── app.controller.ts          # Health check endpoint
├── app.module.ts              # Main module with TypeORM
├── app.service.ts             # Global services
├── main.ts                    # Application entry point
├── database/
│   └── entities/
│       ├── notification.entity.ts    # Notification entity
│       └── index.ts
├── notifications/
│   ├── dto/
│   │   ├── create-notification.dto.ts
│   │   └── index.ts
│   ├── notifications.controller.ts   # REST endpoints
│   ├── notifications.service.ts      # Business logic
│   ├── notifications.gateway.ts      # WebSocket gateway
│   └── notifications.module.ts       # Notifications module
└── rabbitmq/
    ├── rabbitmq.consumer.ts         # RabbitMQ event consumer
    └── rabbitmq.service.ts          # RabbitMQ service
```

## Database Schema

### Notifications Table
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key to User)
- `type`: enum (RESERVATION_CREATED, RESERVATION_CONFIRMED, RESERVATION_CANCELLED, SYSTEM)
- `title`: string (255 characters)
- `message`: text
- `is_read`: boolean
- `created_at`: timestamp
- `updated_at`: timestamp

## API Endpoints

### GET /notifications
Get all notifications for the authenticated user.

**Headers:**
```
Authorization: Bearer <ACCESS_TOKEN>
```

**Query Parameters:**
- `is_read`: Filter by read status (true/false)
- `limit`: Number of notifications to return
- `offset`: Pagination offset

**Response:** 200 OK
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "type": "RESERVATION_CREATED",
    "title": "Reservation Created",
    "message": "Your reservation has been created successfully",
    "is_read": false,
    "created_at": "2026-06-15T09:00:00.000Z",
    "updated_at": "2026-06-15T09:00:00.000Z"
  }
]
```

### GET /notifications/unread-count
Get count of unread notifications for the authenticated user.

**Headers:**
```
Authorization: Bearer <ACCESS_TOKEN>
```

**Response:** 200 OK
```json
{
  "count": 5
}
```

### PATCH /notifications/:id/read
Mark a notification as read.

**Headers:**
```
Authorization: Bearer <ACCESS_TOKEN>
```

**Response:** 200 OK

### PATCH /notifications/read-all
Mark all notifications as read for the authenticated user.

**Headers:**
```
Authorization: Bearer <ACCESS_TOKEN>
```

**Response:** 200 OK

## WebSocket Connection

### Connection URL
```
ws://localhost:3013
```

### Connection with Authentication
```
ws://localhost:3013?token=<JWT_TOKEN>
```

### Events

#### Client → Server
- `join`: Join user's notification channel
  ```typescript
  socket.emit('join', { userId: 'user-uuid' })
  ```

#### Server → Client
- `notification`: New notification received
  ```typescript
  socket.on('notification', (data) => {
    console.log('New notification:', data)
  })
  ```

## RabbitMQ Events

The Notification Service consumes events from RabbitMQ:

### Exchange: `reservation.events`

#### reservation.created
Consumed when a new reservation is created.

**Processing:**
1. Extract user_id from event
2. Create notification in database
3. Emit notification via WebSocket to user
4. Store notification history

#### reservation.confirmed
Consumed when a reservation is confirmed.

#### reservation.cancelled
Consumed when a reservation is cancelled.

## Environment Variables

Required environment variables:

```env
PORT=3013
NODE_ENV=qa
DB_HOST=notification-db-qa
DB_PORT=5432
DB_USERNAME=notifuser
DB_PASSWORD=notifpassword
DB_NAME=notification_service_qa
DB_SSL=false
JWT_SECRET=your-secret-key
CORS_ORIGIN=*
RABBITMQ_URL=amqp://guest:guest@rabbitmq-qa:5672
```

## Development

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15
- RabbitMQ

### Installation

```bash
cd services/notification-service
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
docker-compose -f docker-compose.qa.yml up -d notification-service-qa
```

## Communication with Other Services

The Notification Service communicates with other services through:

1. **RabbitMQ Events**: Consumes events from other services
   - `reservation.created` from Reservation Service
   - `reservation.confirmed` from Reservation Service
   - `reservation.cancelled` from Reservation Service

2. **WebSocket**: Delivers real-time notifications to frontend
   - Frontend connects via WebSocket
   - Service pushes notifications instantly

3. **HTTP API**: Provides notification management endpoints
   - Frontend queries notification history
   - Frontend marks notifications as read

## Notification Flow

```
Reservation Service
        ↓
   RabbitMQ (reservation.events)
        ↓
Notification Service (Consumer)
        ↓
   Database (Store)
        ↓
   WebSocket (Push to User)
        ↓
   Frontend (Display)
```

## Business Logic

### Notification Types
- **RESERVATION_CREATED**: New reservation created
- **RESERVATION_CONFIRMED**: Reservation confirmed
- **RESERVATION_CANCELLED**: Reservation cancelled
- **SYSTEM**: System-wide notifications

### Read/Unread Tracking
- Notifications default to unread
- Users can mark individual notifications as read
- Users can mark all notifications as read at once
- Unread count available via API

### WebSocket Authentication
- JWT token passed via query parameter
- Token validated before allowing connection
- User can only join their own notification channel

## Dependencies

- **@nestjs/common**: Core NestJS modules
- **@nestjs/typeorm**: TypeORM integration
- **@nestjs/websockets**: WebSocket support
- **@nestjs/platform-socket.io**: Socket.io integration
- **@nestjs/microservices**: Microservices support
- **amqplib**: RabbitMQ client
- **typeorm**: ORM for database operations
- **pg**: PostgreSQL client
- **class-validator**: DTO validation
- **class-transformer**: Object transformation
- **socket.io**: WebSocket library

## Troubleshooting

### RabbitMQ Connection Issues
- Verify RabbitMQ is running
- Check RABBITMQ_URL environment variable
- Ensure exchange `reservation.events` exists
- Check queue bindings

### WebSocket Connection Issues
- Verify JWT token is valid
- Check CORS configuration
- Ensure WebSocket port is accessible
- Check firewall settings

### Notification Not Delivered
- Verify user is connected to WebSocket
- Check RabbitMQ event consumption
- Verify user_id in event matches connected user
- Check notification creation in database

### Database Connection Issues
- Verify PostgreSQL is running
- Check DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD
- Ensure database exists

## CI/CD

The service is included in the GitHub Actions CI/CD pipeline:
- **Build**: Docker image built and pushed to ECR
- **Test**: Unit tests run on every PR
- **Deploy**: Deployed to QA/Production environments

## Future Enhancements

- Email notifications
- SMS notifications
- Push notifications (mobile)
- Notification preferences per user
- Notification scheduling
- Notification templates
- Multi-language support
- Notification analytics
