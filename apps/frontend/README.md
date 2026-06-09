# Frontend — UCE Lab Test Panel

Lightweight SPA (Vite + TypeScript) to test the 4 microservices.

## Requirements

- Microservices running (`docker compose up` or individually)
- Same `JWT_SECRET` across all services

## Getting Started

```bash
cd apps/frontend
npm install
npm run dev
```

Open http://localhost:4200

## QA Environment (ports 3010–3013)

http://localhost:4200?env=qa

## What You Can Test

| Section | Endpoints |
|---------|-----------|
| Auth | Login, registration, manual refresh token, auto-renewal on 401, JWT decoded |
| Health | `/health` of each microservice |
| Protected | `/auth/me`, reservations, labs, notifications |
