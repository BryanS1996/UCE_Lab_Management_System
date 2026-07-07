# Notification Service

## Overview
The **Notification Service** handles all outbound communications from the UCE Lab Management System to its users. By decoupling notifications from the core business logic, the system ensures that long-running tasks like sending emails do not block API responses in other services.

## Architecture & Responsibilities
- **Asynchronous Processing**: Listens to RabbitMQ queues for events (e.g., `ReservationCreated`, `IncidentReported`).
- **Email Delivery**: Uses standard SMTP (e.g., NodeMailer via Gmail or AWS SES) to send formatted HTML emails.
- **Retry Mechanism**: If an email fails to send, the message broker can requeue the task, ensuring reliable delivery without burdening the primary service.

## Tech Stack
- **Framework**: NestJS
- **Message Broker**: RabbitMQ
- **Email Delivery**: NodeMailer
- **Language**: TypeScript

## Prerequisites
- Node.js (v18 or higher)
- RabbitMQ server
- Valid SMTP credentials (e.g., Gmail App Password)

## Environment Variables
Create a `.env` file in the root of this service:
```env
PORT=3006
NODE_ENV=development

# RabbitMQ Integration
RABBITMQ_URL=amqp://user:password@localhost:5672

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
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
docker compose up notification-service rabbitmq -d
```
