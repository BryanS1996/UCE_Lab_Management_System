# Laboratory Service

Laboratory management microservice for the UCE Lab Management System.

## Overview

The Laboratory Service manages laboratory information, including registration, availability tracking, and resource management. It provides CRUD operations for laboratories and serves as the central source of truth for laboratory data across the system.

## Technology Stack

- **Framework**: NestJS 11
- **Language**: TypeScript
- **Database**: PostgreSQL 15
- **ORM**: TypeORM
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
│       ├── laboratory.entity.ts    # Laboratory entity
│       └── index.ts
├── laboratories/
│   ├── dto/
│   │   ├── create-laboratory.dto.ts
│   │   ├── update-laboratory.dto.ts
│   │   └── index.ts
│   ├── laboratories.controller.ts   # REST endpoints
│   ├── laboratories.service.ts      # Business logic
│   └── laboratories.module.ts       # Laboratories module
```

## Database Schema

### Laboratories Table
- `lab_id`: string (Primary Key) - Unique identifier for the laboratory
- `name`: string (255 characters) - Laboratory name
- `description`: text - Detailed description
- `location`: string (255 characters) - Physical location
- `max_capacity`: integer - Maximum number of people
- `status`: enum (ACTIVE, INACTIVE, MAINTENANCE) - Current status
- `is_active`: boolean - Active flag
- `created_by`: string - User who created the record
- `updated_by`: string - User who last updated the record
- `created_at`: timestamp - Creation timestamp
- `updated_at`: timestamp - Last update timestamp
- `version`: integer - Optimistic locking version

## API Endpoints

### GET /laboratories
Get all laboratories with optional filtering.

**Query Parameters:**
- `status`: Filter by status (ACTIVE, INACTIVE, MAINTENANCE)
- `is_active`: Filter by active status (true/false)

**Response:** 200 OK
```json
[
  {
    "lab_id": "lab-001",
    "name": "Laboratory Computación 12",
    "description": "Standard laboratory for computer science practices",
    "location": "Torre de Ciencias Piso 3 - Sala 111",
    "max_capacity": 34,
    "status": "ACTIVE",
    "is_active": true,
    "created_at": "2026-06-01T00:00:00.000Z",
    "updated_at": "2026-06-01T00:00:00.000Z",
    "version": 1
  }
]
```

### GET /laboratories/:lab_id
Get a specific laboratory by ID.

**Response:** 200 OK
```json
{
  "lab_id": "lab-001",
  "name": "Laboratory Computación 12",
  "description": "Standard laboratory for computer science practices",
  "location": "Torre de Ciencias Piso 3 - Sala 111",
  "max_capacity": 34,
  "status": "ACTIVE",
  "is_active": true,
  "created_at": "2026-06-01T00:00:00.000Z",
  "updated_at": "2026-06-01T00:00:00.000Z",
  "version": 1
}
```

### POST /laboratories
Create a new laboratory (admin only).

**Request Body:**
```json
{
  "lab_id": "lab-002",
  "name": "Laboratory de Física",
  "description": "Physics laboratory with experimental equipment",
  "location": "Torre de Ciencias Piso 2 - Sala 201",
  "max_capacity": 25,
  "status": "ACTIVE"
}
```

**Response:** 201 Created

### PATCH /laboratories/:lab_id
Update laboratory details (admin only).

**Request Body:**
```json
{
  "name": "Laboratory de Física Avanzada",
  "max_capacity": 30,
  "status": "MAINTENANCE"
}
```

**Response:** 200 OK

### DELETE /laboratories/:lab_id
Delete a laboratory (admin only).

**Response:** 200 OK

## Environment Variables

Required environment variables:

```env
PORT=3012
NODE_ENV=qa
DB_HOST=laboratory-db-qa
DB_PORT=5432
DB_USERNAME=labuser
DB_PASSWORD=labpassword
DB_NAME=laboratory_service_qa
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

### Installation

```bash
cd services/laboratory-service
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
docker-compose -f docker-compose.qa.yml up -d laboratory-service-qa
```

## Database Initialization

Laboratories are automatically initialized on first database startup using the SQL script in `db-init/init-laboratories.sql`. This script:

- Connects to the `laboratory_service_qa` database
- Inserts 50+ pre-configured laboratories across different departments
- Uses `ON CONFLICT DO NOTHING` to prevent duplicate inserts on restart

**Initialization Flow:**
1. PostgreSQL container starts
2. Script in `/docker-entrypoint-initdb.d/` executes automatically
3. Laboratories are inserted with proper schema
4. Service can immediately query available laboratories

## Communication with Other Services

The Laboratory Service communicates with other services through:

1. **REST API**: Other services query laboratory information
   - Reservation Service validates lab availability
   - Frontend displays laboratory list
   - Notification Service includes lab details in messages

2. **RabbitMQ**: Publishes laboratory lifecycle events (future)
   - `laboratory.created` → Analytics Service
   - `laboratory.updated` → Cache invalidation
   - `laboratory.deleted` → Reservation cleanup

3. **JWT Validation**: Validates admin tokens for write operations

## Business Logic

### Laboratory Status Management
- **ACTIVE**: Available for reservations
- **MAINTENANCE**: Temporarily unavailable
- **INACTIVE**: Permanently closed

### Capacity Validation
- Ensures `max_capacity` is a positive integer
- Validates against reservation counts (future integration)

### Location Tracking
- Standardized location format
- Supports multi-campus locations

## Dependencies

- **@nestjs/common**: Core NestJS modules
- **@nestjs/typeorm**: TypeORM integration
- **typeorm**: ORM for database operations
- **pg**: PostgreSQL client
- **class-validator**: DTO validation
- **class-transformer**: Object transformation

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD
- Ensure database exists

### Laboratory Not Found
- Verify `lab_id` format (string, not integer)
- Check if laboratory was deleted
- Verify database initialization script ran

### Initialization Script Not Running
- Check volume mount in docker-compose.qa.yml
- Verify script exists in `db-init/` directory
- Ensure database is being created for the first time

## CI/CD

The service is included in the GitHub Actions CI/CD pipeline:
- **Build**: Docker image built and pushed to ECR
- **Test**: Unit tests run on every PR
- **Deploy**: Deployed to QA/Production environments

## Future Enhancements

- Real-time availability tracking
- Equipment inventory management
- Laboratory scheduling integration
- Image uploads for laboratory photos
- Advanced filtering and search
- Geographic location support
- Maintenance scheduling
