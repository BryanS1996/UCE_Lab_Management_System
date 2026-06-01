# UCE Lab Management System

Lab management system with microservices architecture.

## 🚀 Quick Start

### 1. Install dependencies
```bash
cd services/auth-service
npm install
```

### 2. Start services
```bash
# From project root
docker-compose up -d
```

### 3. Test endpoint
```bash
# Register user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "password": "SecurePass123!"
  }'
```

## 📋 Endpoints

### Auth (Public)
```
POST /auth/register     - Register user
POST /auth/login        - Login
```

### Auth (Protected)
```
GET  /auth/me           - Get current user info
POST /auth/change-password
```

### Users (Protected)
```
GET    /users           - List all users
GET    /users/:id       - Get user by ID
PATCH  /users/:id       - Update user
DELETE /users/:id       - Delete user
```

## 🐳 Docker

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Clean everything (including volumes)
docker-compose down -v
```

## 📦 Environment Variables

Automatically configured in `docker-compose.yml`:
- JWT_SECRET: `dev-secret-key-change-in-production`
- DB_HOST: `auth-db`
- DB_PASSWORD: `authpassword`

## 🔗 Development Workflow

1. **Edit code** → Changes reflect automatically (hot-reload)
2. **Git push** → Push changes to GitHub
3. **Docker build & push** → Push image to Docker Hub
4. **AWS** → Clone on instance and test

## 📝 Structure

```
services/
├── auth-service/        # Authentication microservice
│   ├── src/
│   ├── Dockerfile
│   ├── package.json
│   └── README.md
```

## 🔑 Database

PostgreSQL runs on port 5432
- User: `authuser`
- Password: `authpassword`
- Database: `auth_service_qa`

```bash
# Connect to PostgreSQL
psql -h localhost -U authuser -d auth_service_qa
```

## 🐛 Troubleshooting

**Port 5432 in use:**
```bash
docker-compose down -v
docker-compose up -d
```

**Service not starting:**
```bash
docker-compose logs auth-service
```

**Reinstall dependencies:**
```bash
cd services/auth-service
rm -rf node_modules package-lock.json
npm install
docker-compose up -d
```

## 📖 More information

- [`services/auth-service/README.md`](services/auth-service/README.md) - Service documentation
- [`services/auth-service/src`](services/auth-service/src) - Source code
