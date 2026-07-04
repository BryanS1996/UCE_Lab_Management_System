# Auth Service

## Overview
The **Auth Service** is responsible for managing user identities, authentication, and authorization within the UCE Lab Management System. It ensures that only valid users can access resources, and manages the Role-Based Access Control (RBAC) definitions (e.g., Student, Professor, Admin).

## Architecture & Responsibilities
- **Authentication**: Validates credentials and generates secure JSON Web Tokens (JWT).
- **Authorization**: Determines if a user has the appropriate role to perform a requested action.
- **User Management**: Handles registration, login, and profile updates.
- **Database**: Uses **PostgreSQL** to securely store user credentials (hashed) and profile data.

## Tech Stack
- **Framework**: NestJS
- **Database ORM**: TypeORM (PostgreSQL)
- **Security**: Passport.js, bcrypt, JWT

## Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- Redis (optional, if using token blacklisting)

## Environment Variables
Create a `.env` file in the root of this service:
```env
PORT=3001
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=auth_user
DB_PASS=secure_password
DB_NAME=auth_db

# JWT Configuration
JWT_SECRET=super_secret_jwt_key
JWT_EXPIRES_IN=1h
```

## Running the Service

### Locally (Development)
```bash
# Install dependencies
npm install

# Run migrations (if applicable)
npm run typeorm migration:run

# Start in watch mode
npm run start:dev
```

### Via Docker Compose
```bash
docker compose up auth-service auth-db -d
```

## Available Endpoints
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Authenticate and receive a JWT
- `GET /auth/profile` - Get current user profile (Requires JWT)
