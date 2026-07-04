# Payment Service

## Overview
The **Payment Service** handles financial transactions within the UCE Lab Management System. It is primarily used to process payments for premium laboratory tiers, specialized equipment rentals, or external usage fees.

## Architecture & Responsibilities
- **Stripe Integration**: Integrates directly with the Stripe API to generate secure Checkout Sessions.
- **Webhook Handling**: Listens for asynchronous Stripe Webhooks to confirm successful payments.
- **Event Broadcasting**: Once a payment is confirmed, it emits a `PaymentCompleted` event via RabbitMQ, allowing the Reservation Service to finalize the booking.

## Tech Stack
- **Framework**: NestJS
- **Payment Gateway**: Stripe API (`stripe` Node package)
- **Message Broker**: RabbitMQ
- **Language**: TypeScript

## Prerequisites
- Node.js (v18 or higher)
- RabbitMQ server
- Stripe Developer Account (Test Keys)

## Environment Variables
Create a `.env` file in the root of this service:
```env
PORT=3008
NODE_ENV=development

# RabbitMQ Integration
RABBITMQ_URL=amqp://user:password@localhost:5672

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=http://localhost:5173
```

## Running the Service

### Locally (Development)
```bash
# Install dependencies
npm install

# Start in watch mode
npm run start:dev
```

### Stripe Webhooks Locally
To test webhooks locally without a public IP, use the Stripe CLI:
```bash
stripe listen --forward-to localhost:3008/payments/webhook
```

### Via Docker Compose
```bash
docker compose up payment-service rabbitmq -d
```

## Available Endpoints
- `POST /payments/create-session` - Generates a Stripe Checkout URL
- `POST /payments/webhook` - Stripe Webhook listener (Requires raw body)
