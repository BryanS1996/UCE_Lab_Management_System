# Catalog Service

## Overview
The **Catalog Service** manages the inventory of physical and digital assets available in the UCE Lab Management System. This includes laboratories, specific workstations, or specialized equipment that can be reserved by users.

It acts as the "Source of Truth" for what exists in the facility, before any reservation is made.

## Architecture & Responsibilities
- **Inventory Management**: Defines properties of laboratories (e.g., name, capacity, description, tier).
- **Availability State**: Tracks the real-time status of an asset (`AVAILABLE`, `OCCUPIED`, `MAINTENANCE`).
- **Database**: Uses **PostgreSQL** to store the catalog definitions.

## Tech Stack
- **Framework**: NestJS
- **Database ORM**: TypeORM (PostgreSQL)
- **Language**: TypeScript

## Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database

## Environment Variables
Create a `.env` file in the root of this service:
```env
PORT=3009
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=catalog_user
DB_PASS=secure_password
DB_NAME=catalog_db
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
docker compose up catalog-service catalog-db -d
```

## Available Endpoints
- `GET /catalog` - List all available laboratories/items
- `GET /catalog/:id` - Get details for a specific item
- `POST /catalog` - Add a new item to the inventory (Admin only)
- `PATCH /catalog/:id/status` - Update the operational status of an item
