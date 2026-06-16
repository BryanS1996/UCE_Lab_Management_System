# UCE Lab Management System

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge\&logo=react\&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=for-the-badge\&logo=nestjs\&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge\&logo=typescript\&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge\&logo=postgresql\&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-3.x-FF6600?style=for-the-badge\&logo=rabbitmq\&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge\&logo=docker\&logoColor=white)
![Terraform](https://img.shields.io/badge/Terraform-7B42BC?style=for-the-badge\&logo=terraform\&logoColor=white)
![AWS EC2](https://img.shields.io/badge/AWS_EC2-FF9900?style=for-the-badge\&logo=amazonaws\&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI/CD-2088FF?style=for-the-badge\&logo=githubactions\&logoColor=white)

[![Repository](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge\&logo=github)](https://github.com/BryanS1996/UCE_Lab_Management_System)

![Auth CI](https://github.com/BryanS1996/UCE_Lab_Management_System/actions/workflows/auth-service-ci.yml/badge.svg)
![Laboratory CI](https://github.com/BryanS1996/UCE_Lab_Management_System/actions/workflows/laboratory-service-ci.yml/badge.svg)
![Reservation CI](https://github.com/BryanS1996/UCE_Lab_Management_System/actions/workflows/reservation-service-ci.yml/badge.svg)
![Notification CI](https://github.com/BryanS1996/UCE_Lab_Management_System/actions/workflows/notification-service-ci.yml/badge.svg)
![Gateway CI](https://github.com/BryanS1996/UCE_Lab_Management_System/actions/workflows/gateway-ci.yml/badge.svg)

# Enterprise Microservices Platform for University Laboratory Management

Cloud-native distributed system developed using Microservices Architecture, Event-Driven Architecture (EDA), Infrastructure as Code (IaC), CI/CD automation, and modern cloud-native practices.

---

## Project Overview

The UCE Lab Management System is a scalable platform designed to manage university laboratories, reservations, resources, notifications, and future analytical services.

The project was built following:

* Microservices Architecture
* Domain-Driven Design (DDD)
* Event-Driven Architecture (EDA)
* Infrastructure as Code (Terraform)
* Continuous Integration / Continuous Deployment (CI/CD)
* Cloud-Native Design Principles

---

## Key Features

### Authentication & Security

* JWT Authentication
* Role-Based Access Control (RBAC)
* Password Hashing (bcrypt)
* Protected Endpoints
* Shared Authentication Strategy

### Laboratory Management

* Laboratory Registration
* Resource Administration
* Availability Tracking

### Reservation Management

* Reservation Creation
* Reservation Confirmation
* Reservation Cancellation
* Reservation History

### Notifications

* RabbitMQ Event Consumers
* Real-Time Notification Support
* WebSocket Integration

### Infrastructure

* Docker Containers
* Docker Compose Environments
* Terraform Infrastructure
* Kubernetes Deployment Structure

### Observability

* Prometheus Metrics
* Grafana Dashboards
* Loki Log Aggregation

---

## System Architecture

```text
Frontend (React + TypeScript + Tailwind CSS)
        │
        ▼
 ┌──────┼─────────────────────────────────────┐
 │      │       │        │                    │
 ▼      ▼       ▼        ▼                    ▼

Auth Laboratory Reservation Notification
Service  Service    Service    Service

        │
        ▼

     RabbitMQ
(Event Broker)

        │
        ▼

PostgreSQL Databases
(Database per Service)
```

---

## Technology Stack

### Frontend

* React 18
* TypeScript
* Tailwind CSS
* Lucide React Icons
* Vite

### Backend

* NestJS 11
* TypeScript
* REST APIs
* Swagger / OpenAPI

### Data Layer

* PostgreSQL 15
* TypeORM

### Messaging

* RabbitMQ

### DevOps

* Docker
* Docker Compose
* GitHub Actions

### Cloud & Infrastructure

* Terraform
* Kubernetes

### Monitoring

* Prometheus
* Grafana
* Loki

---

## Repository Structure

```text
UCE_Lab_Management_System/

├── apps/
│   └── frontend/
│
├── services/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── laboratory-service/
│   ├── reservation-service/
│   ├── notification-service/
│   ├── audit-service/
│   ├── analytics-service/
│   ├── incident-service/
│   ├── payment-service/
│   └── ai-service/
│
├── shared/
│
├── docs/
│
├── infra/
│   ├── kubernetes/
│   ├── terraform/
│   └── monitoring/
│
├── scripts/
│
├── docker-compose.yml
├── docker-compose.qa.yml
├── docker-compose.prod.yml
└── README.md
```

---

## Implemented Services

### Auth Service

Responsibilities:

* User Registration
* User Authentication
* JWT Management
* Password Management
* Role Management

---

### Laboratory Service

Responsibilities:

* Laboratory CRUD
* Resource Management
* Availability Management

---

### Reservation Service

Responsibilities:

* Reservation Lifecycle
* Validation Rules
* Reservation Tracking

Published Events:

```text
reservation.created
reservation.confirmed
reservation.cancelled
```

---

### Notification Service

Responsibilities:

* Event Consumption
* Notification Delivery
* WebSocket Notifications

---

## Services Under Development

### API Gateway

Planned Features:

* Centralized Routing
* Authentication Validation
* Rate Limiting
* Request Aggregation

### Audit Service

* Audit Logs
* Security Events
* Compliance Tracking

### Analytics Service

* KPI Generation
* Usage Metrics
* Reporting

### Incident Service

* Incident Tracking
* Maintenance Requests

### Payment Service

* Payment Integrations
* Billing Workflows

### AI Service

* Predictive Analytics
* Intelligent Recommendations
* Scheduling Optimization

---

## Event-Driven Architecture

RabbitMQ acts as the communication backbone.

Current Event Flow:

```text
Reservation Service
        │
        ▼
RabbitMQ
        │
        ▼
Notification Service
```

Future Consumers:

* Audit Service
* Analytics Service
* AI Service

---

## Shared Library

The shared package contains:

### Enums

* User Roles
* Reservation Status
* Notification Types

### Events

* ReservationCreatedEvent
* ReservationConfirmedEvent
* ReservationCancelledEvent
* NotificationSentEvent
* LaboratoryCreatedEvent

### Interfaces

* JWT Payload
* Audit Log
* Service Responses

---

## Infrastructure as Code

Terraform Structure:

```text
infra/terraform/

├── bootstrap/
├── environments/
│   ├── qa/
│   └── prod/
└── modules/
    ├── vpc/
    ├── ec2/
    ├── ecr/
    ├── rds/
    ├── iam/
    └── monitoring/
```

---

## Monitoring & Observability

### Prometheus

Metrics collection and monitoring.

### Grafana

Dashboard visualization.

### Loki

Centralized logging.

---

## CI/CD Pipelines

GitHub Actions workflows:

* auth-service-ci
* laboratory-service-ci
* reservation-service-ci
* notification-service-ci
* gateway-ci
* pr-validation
* deploy-qa
* deploy-prod
* terraform-plan
* terraform-plan-qa
* terraform-apply
* terraform-apply-qa
* terraform-bootstrap

Automated tasks include:

* Build Validation
* Unit Testing
* Pull Request Validation
* Deployment Automation
* Infrastructure Provisioning

---

## Local Development

Start development environment:

```bash
docker compose up -d
```

QA environment:

```bash
docker compose -f docker-compose.qa.yml up -d
```

Production simulation:

```bash
docker compose -f docker-compose.prod.yml up -d
```

---

## Deployment to AWS EC2

The system supports deploying to AWS EC2 using Docker Compose with pre-built images from Docker Hub.

### Quick Deploy

**Production (with RDS)**:
```bash
./scripts/deploy-prod.sh docker /root/.env.prod
```

**QA (all services in Docker)**:
```bash
./scripts/deploy-qa.sh docker /root/.env.qa
```

### How It Works

1. **GitHub Actions** publishes images to Docker Hub with tags:
   - `bryanfabricio96/auth-service:prod` → PROD environment
   - `bryanfabricio96/auth-service:qa` → QA environment
   - (same for other services)

2. **Terraform** provisions EC2 instances with Docker pre-installed

3. **Deployment Script** (`deploy-docker-compose.sh`):
   ```bash
   ./scripts/deploy-docker-compose.sh prod /root/.env.prod
   ```
   - Loads environment variables from `.env` file
   - Pulls images from Docker Hub (`docker-compose pull`)
   - Starts services in background (`docker-compose up -d`)
   - Verifies health checks

4. **Services run** with these image sources:
   - **PROD**: Images from Docker Hub (tag: `prod`), databases on AWS RDS
   - **QA**: Images from Docker Hub (tag: `qa`), databases in Docker containers

### Environment Configuration

Create `.env.prod` for production:
```bash
NODE_ENV=production
AUTH_DB_HOST=<rds-endpoint>
AUTH_DB_USER=authuser
AUTH_DB_PASS=<strong-password>
# ... other database credentials
JWT_SECRET=<random-secret>
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
```

Create `.env.qa` for QA (minimal, uses Docker containers):
```bash
NODE_ENV=qa
# Most settings use defaults for Docker networking
```

### Full Documentation

See [docs/deployment/DOCKER_COMPOSE_EC2.md](docs/deployment/DOCKER_COMPOSE_EC2.md) for complete setup guide.

---

## Security Practices

Implemented:

* JWT Authentication
* RBAC Authorization
* Password Hashing
* Service Isolation
* Database Isolation

Future Improvements:

* OAuth2
* OpenID Connect
* JWKS
* Secrets Manager Integration

---

## Roadmap

* Complete Angular Frontend
* Complete API Gateway
* Complete Audit Service
* Complete Analytics Service
* Complete Incident Service
* Complete AI Service
* Kubernetes Production Deployment
* OpenTelemetry Distributed Tracing
* Grafana Dashboards
* Prometheus Service Metrics

---

## Screenshots

Coming Soon

```text
docs/images/
├── dashboard.png
├── laboratories.png
├── reservations.png
└── analytics.png
```

---

## Author

**Bryan Chileno**

Universidad Central del Ecuador (UCE)

Distributed Programming Project

2026

GitHub: https://github.com/BryanS1996
https://deepwiki.com/badge-maker?url=https%3A%2F%2Fdeepwiki.com%2FBryanS1996%2FUCE_Lab_Management_System
---

## License

This project is intended for educational, research, and portfolio purposes.
