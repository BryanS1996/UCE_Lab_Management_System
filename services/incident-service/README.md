# Incident Service

## Overview
The **Incident Service** manages the reporting and tracking of incidents, damages, and maintenance requests within the UCE laboratories. It is highly integrated with an external **AWS Lambda** Serverless function for AI-based Natural Language Processing (NLP), automatically categorizing the severity and type of incident reported by the user.

## Architecture & Responsibilities
- **Incident Reporting**: Accepts user reports including descriptions, laboratory IDs, and image evidence URLs.
- **AI Integration**: Calls an external `IA_LAMBDA_URL` via HTTP to analyze the textual description before saving the document.
- **Database**: Uses **MongoDB** for flexible, document-based storage of incidents and their evolving statuses.

## Tech Stack
- **Framework**: NestJS
- **Database ORM**: Mongoose (MongoDB)
- **HTTP Client**: `@nestjs/axios`
- **External Dependencies**: AWS API Gateway + AWS Lambda (Serverless)

## Prerequisites
- Node.js (v18 or higher)
- MongoDB instance
- Deployed AWS Lambda for AI analysis

## Environment Variables
Create a `.env` file in the root of this service:
```env
PORT=3007
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/incidents

# Microservices Integration
RESERVATION_SERVICE_URL=http://localhost:3003

# AWS API Gateway Endpoint for Serverless Lambda
IA_LAMBDA_URL=https://xxxxxx.execute-api.us-east-1.amazonaws.com/default/ia-incident-analyzer
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
docker compose up incident-service mongo -d
```

## Available Endpoints
- `POST /incidents` - Report a new incident (Triggers AI analysis automatically)
- `GET /incidents/:id` - Fetch an incident by ID
- `PATCH /incidents/:id/status` - Update an incident's resolution status
