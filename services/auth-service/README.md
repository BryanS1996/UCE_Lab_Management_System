# Auth Service

Authentication and user management microservice for the UCE Lab Management System.

## Overview

The Auth Service is responsible for user authentication, authorization, and user management. It provides JWT-based authentication and role-based access control (RBAC) for the entire system.

## Technology Stack

- **Framework**: NestJS 11
- **Language**: TypeScript
- **Database**: PostgreSQL 15
- **ORM**: TypeORM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt

## Architecture

### Directory Structure

```
src/
├── auth/              # Authentication module
│   ├── dto/          # Request/Response DTOs
│   ├── guards/       # JWT Auth Guard, Roles Guard
│   ├── strategies/   # JWT Strategy
│   └── auth.service.ts
├── users/            # User CRUD operations
├── database/         # Database entities (User, Role)
├── common/           # Shared utilities
└── main.ts          # Application entry point
```

## Database Schema

### Users Table
- `id`: UUID (Primary Key)
- `email`: string (Unique)
- `firstName`: string
- `lastName`: string
- `password`: string (bcrypt hash)
- `isActive`: boolean
- `lastLogin`: timestamp
- `refreshToken`: string
- `createdAt`: timestamp
- `updatedAt`: timestamp

### Roles Table
- `id`: UUID (Primary Key)
- `name`: enum (admin, professor, student, lab_manager)
- `description`: string

### User_Roles Table (Many-to-Many)
- Links users to roles for RBAC

## API Endpoints

### Authentication

#### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "roles": []
  }
}
```

#### POST /auth/login
Authenticate user and receive tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": { ... }
}
```

#### POST /auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

#### GET /auth/me
Get current user information (requires JWT).

**Headers:**
```
Authorization: Bearer <ACCESS_TOKEN>
```

### Users

#### GET /users
List all users (requires JWT + admin role).

#### GET /users/:id
Get user by ID (requires JWT).

#### PATCH /users/:id
Update user information (requires JWT).

#### DELETE /users/:id
Delete user (requires JWT + admin role).

## JWT Authentication Flow

1. User registers or logs in
2. Service validates credentials
3. Service generates two tokens:
   - **Access Token**: Valid for 15 minutes
   - **Refresh Token**: Valid for 7 days
4. Client includes Access Token in `Authorization: Bearer <token>` header
5. When Access Token expires, client uses Refresh Token to get new tokens

## Security Features

- **Password Requirements**: 8+ characters, uppercase, lowercase, numbers, special characters
- **Password Hashing**: bcrypt with salt rounds
- **JWT Secret**: Environment variable for token signing
- **Role-Based Access Control**: Guards protect routes based on user roles
- **CORS**: Configurable CORS origins

## Environment Variables

Required environment variables:

```env
PORT=3000
NODE_ENV=development
DB_HOST=auth-db-qa
DB_PORT=5432
DB_USERNAME=authuser
DB_PASSWORD=authpassword
DB_NAME=auth_service_qa
DB_SSL=false
JWT_SECRET=your-secret-key
CORS_ORIGIN=*
```

## Development

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15

### Installation

```bash
cd services/auth-service
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
docker-compose -f docker-compose.qa.yml up -d auth-service-qa
```

## Communication with Other Services

The Auth Service communicates with other services through:

1. **JWT Tokens**: Other services validate JWT tokens issued by Auth Service
2. **Shared JWT Secret**: All services use the same JWT_SECRET for token validation
3. **User Information**: Other services call `/auth/me` to get user details

## Dependencies

- **@nestjs/common**: Core NestJS modules
- **@nestjs/jwt**: JWT authentication
- **@nestjs/passport**: Passport integration
- **passport**: Authentication middleware
- **passport-jwt**: JWT strategy for Passport
- **typeorm**: ORM for database operations
- **pg**: PostgreSQL client
- **bcrypt**: Password hashing
- **class-validator**: DTO validation
- **class-transformer**: Object transformation

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD
- Ensure database exists

### JWT Validation Errors
- Ensure JWT_SECRET matches across all services
- Check token expiration (15 minutes for access tokens)
- Verify token format in Authorization header

### Password Issues
- Ensure password meets requirements (8+ chars, uppercase, lowercase, numbers, special chars)
- Check bcrypt hash comparison

## CI/CD

The service is included in the GitHub Actions CI/CD pipeline:
- **Build**: Docker image built and pushed to ECR
- **Test**: Unit tests run on every PR
- **Deploy**: Deployed to QA/Production environments

## Future Enhancements

- OAuth2 integration
- OpenID Connect support
- Password reset functionality
- Email verification
- Two-factor authentication (2FA)
- Session management

```
src/
├── auth/              # Authentication module
│   ├── dto/          # Request validation
│   ├── guards/       # JwtAuthGuard, RolesGuard
│   ├── strategies/   # JWT strategy
│   └── auth.service.ts
├── users/            # User CRUD
├── database/         # Entities (User, Role)
├── common/           # Shared code
└── main.ts
```

## 🔌 API Endpoints

### Register
```bash
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": { ... }
}
```

### Login
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

### Use Token
```bash
GET /auth/me
Authorization: Bearer <ACCESS_TOKEN>
```

## ⚙️ Configuration

All variables injected from `docker-compose.yml`:
- JWT_SECRET
- DB_HOST, DB_PASSWORD, etc.
- PORT, NODE_ENV

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start in development mode (with hot-reload)
npm run start:dev

# Build
npm run build

# Production
npm run start:prod

# Tests
npm test
npm run test:e2e
```


## 🐳 Docker

Service runs automatically with `docker-compose up -d` from root.

## 📦 Password Requirements

- 8+ characters
- Uppercase and lowercase letters
- Numbers
- Special characters (@$!%*?&)

**Valid example:** `SecurePass123!`

## 🔐 JWT Tokens

- Access Token: 15 minutes
- Refresh Token: 7 days

## 💾 Database

TypeORM creates tables automatically:
- `users` - Users
- `roles` - Roles
- `user_roles` - M:M relationship

## 🚀 Inicio Rápido (Desarrollo Local)

### Prerrequisitos
- Node.js >= 18
- Docker & Docker Compose
- PostgreSQL 15 (opcional si usas Docker)

### Instalación

1. **Clonar y navegar al directorio**
```bash
cd services/auth-service
npm install
```

2. **Iniciar con Docker Compose**
```bash
docker-compose -f docker-compose.override.yml up -d
```

Esto levantará:
- PostgreSQL 15 en puerto 5432
- Auth Service en puerto 3000

3. **Iniciar en modo desarrollo**
```bash
npm run start:dev
```

## 📦 Scripts Disponibles

```bash
# Desarrollo
npm run start:dev       # Inicia en modo watch

# Compilación
npm run build           # Compila TypeScript

# Producción
npm run start:prod      # Inicia la aplicación compilada

# Testing
npm test                # Ejecuta tests unitarios
npm run test:watch      # Tests en watch mode
npm run test:cov        # Coverage report
npm run test:e2e        # Tests E2E

# Linting
npm run lint            # Ejecuta ESLint
npm run format          # Formatea con Prettier
```

## 🔐 Variables de Entorno

Crea un archivo `.env` con las siguientes variables:

```env
PORT=3000
DB_HOST=your_db_host
DB_PORT=5432
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
JWT_SECRET=your_jwt_secret_key
CORS_ORIGIN=your_cors_origin
```

## 🏢 Infraestructura

La configuración de infraestructura se maneja desde tu cuenta educativa de AWS

## 🔑 Endpoints API

### Autenticación
- `POST /auth/register` - Registrar nuevo usuario
- `POST /auth/login` - Login de usuario
- `POST /auth/change-password` - Cambiar contraseña (requiere JWT)
- `GET /auth/me` - Obtener información del usuario actual (requiere JWT)

### Usuarios
- `GET /users` - Listar usuarios (requiere JWT)
- `GET /users/:id` - Obtener usuario por ID (requiere JWT)
- `PATCH /users/:id` - Actualizar usuario (requiere JWT)
- `DELETE /users/:id` - Eliminar usuario (requiere JWT + rol admin)

## 📝 Ejemplo de Uso

### Registrarse
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "firstName": "Juan",
    "lastName": "Perez",
    "password": "SecurePass123!"
  }'
```

**Respuesta:**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "usuario@example.com",
    "firstName": "Juan",
    "lastName": "Perez",
    "roles": []
  }
}
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "SecurePass123!"
  }'
```

### Obtener Usuario Actual
```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer <accessToken>"
```

## 🗄️ Modelos de Base de Datos

### User
```typescript
{
  id: UUID;                    // Identificador único
  email: string;               // Email único
  firstName: string;           // Nombre
  lastName: string;            // Apellido
  password: string;            // Hash de contraseña
  isActive: boolean;           // Estado del usuario
  lastLogin: Date;             // Último login
  refreshToken: string;        // Token de refresco
  roles: Role[];               // Roles asignados
  createdAt: Date;             // Fecha de creación
  updatedAt: Date;             // Fecha de actualización
}
```

### Role
```typescript
{
  id: UUID;
  name: enum ['admin', 'professor', 'student', 'lab_manager'];
  description: string;
  users: User[];
}
```

## 🔄 Flujo de Autenticación JWT

1. Usuario realiza login con email y contraseña
2. Sistema verifica credenciales y genera tokens:
   - **Access Token**: Válido por 15 minutos
   - **Refresh Token**: Válido por 7 días
3. Cliente usa Access Token en header `Authorization: Bearer <token>`
4. Cuando Access Token expira, usar Refresh Token para obtener uno nuevo

## 🚢 Deployment

### Docker
```bash
# Build
docker build -t auth-service:latest .

# Run
docker run -p 3000:3000 \
  --env-file .env \
  auth-service:latest
```



## 🧪 Testing

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

## 📚 Documentación Adicional

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [Passport.js Documentation](http://www.passportjs.org)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8949)

## 🤝 Ramas de Desarrollo

- `main`: Rama principal
- `feature/auth-service`: Desarrollo del servicio de autenticación

## 📋 Checklist de Configuración

- [ ] Crear archivo `.env` con variables requeridas
- [ ] Generar contraseñas seguras y secretos JWT
- [ ] Configurar acceso a la base de datos
- [ ] Probar endpoints de autenticación
- [ ] Configurar CI/CD en GitHub Actions
- [ ] Configurar monitoreo con CloudWatch
- [ ] Hacer pruebas de endpoints
- [ ] Documentar cambios en CHANGELOG

## ⚠️ Notas Importantes

1. **Nunca** commitear `.env` o secretos en Git
2. Usar variables de entorno seguras en tu cuenta educativa de AWS
3. Generar contraseñas seguras y secretos JWT
4. Los logs se exportan según tu configuración en AWS

## 🆘 Troubleshooting

### Error de conexión a BD
```bash
# Verificar estado de la base de datos
aws rds describe-db-instances --db-instance-identifier auth-service-db

# Verificar security groups
aws ec2 describe-security-groups --group-ids sg-xxxxx
```

### Error de autenticación JWT
- Verificar JWT_SECRET es igual en todos los servicios
- Verificar que Access Token no esté expirado (15m)
- Verificar formato del header: `Authorization: Bearer <token>`

## 📞 Soporte

Para reportar bugs o sugerir mejoras:
- Crear issue en GitHub
- Contactar al equipo de desarrollo

---

**Última actualización:** Junio 2026
**Versión:** 1.0.0
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
