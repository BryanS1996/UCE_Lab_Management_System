# Deployment Verification Checklist

## Pre-Deployment Checks

### Code Changes
- [ ] All code changes committed to appropriate branch (qa or main)
- [ ] API Gateway code reviewed and tested
- [ ] Nginx configuration updated to use API Gateway
- [ ] Docker Compose files updated with API Gateway
- [ ] GitHub Actions workflows updated
- [ ] Environment variables documented

### API Gateway Verification
- [ ] API Gateway service created in `services/api-gateway/`
- [ ] All microservice modules implemented (auth, laboratory, reservation, notification)
- [ ] Health check endpoint implemented at `/health`
- [ ] Service URLs configured correctly
- [ ] JWT_SECRET configured
- [ ] CORS_ORIGIN configured
- [ ] Dockerfile created and tested

### Docker Compose QA Verification
- [ ] Backend services have no port mappings (auth, reservation, laboratory, notification)
- [ ] API Gateway service added with port 3000 exposed
- [ ] API Gateway has health check configured
- [ ] API Gateway depends on all backend services
- [ ] Frontend depends on API Gateway
- [ ] Database services have health checks
- [ ] RabbitMQ service has health check
- [ ] Network configuration correct (uce-qa-network)

### Docker Compose Production Verification
- [ ] Backend services have no port mappings
- [ ] API Gateway service added with port 3000 exposed
- [ ] Frontend service added with port 80 exposed
- [ ] Database services added (auth-db, reservation-db, laboratory-db, notification-db)
- [ ] RabbitMQ service added
- [ ] All services have health checks
- [ ] Environment variables use `${VAR_NAME}` format
- [ ] ECR_REGISTRY variable configured
- [ ] Volumes defined for databases and RabbitMQ
- [ ] Network configuration correct (uce-prod-network)

### GitHub Actions Verification
- [ ] deploy-qa.yml includes API Gateway build step
- [ ] deploy-qa.yml includes API Gateway in docker compose pull
- [ ] deploy-qa.yml health checks updated to use API Gateway
- [ ] deploy-prod.yml includes API Gateway build step
- [ ] deploy-prod.yml includes Frontend build step
- [ ] deploy-prod.yml health checks updated to use API Gateway
- [ ] All services use ECR registry

### Nginx Configuration Verification
- [ ] nginx.conf uses single `/api/` location block
- [ ] nginx.conf proxies to `http://api-gateway-qa:3000/api/`
- [ ] nginx.prod.conf proxies to `http://api-gateway:3000/api/`
- [ ] WebSocket support configured (Upgrade/Connection headers)
- [ ] Health check endpoint configured
- [ ] Dockerfile uses `ARG ENV` to select nginx config

## Deployment Execution

### QA Deployment
- [ ] Push to `qa` branch triggers deploy-qa.yml
- [ ] Tests pass for all services
- [ ] Docker images built and pushed to ECR
- [ ] Docker compose file copied to EC2 instances
- [ ] db-init folder copied to EC2 instances
- [ ] Docker compose pull executed successfully
- [ ] Docker compose up executed successfully
- [ ] Health checks pass:
  - [ ] API Gateway: `curl http://localhost:3000/health`
  - [ ] Frontend: `curl http://localhost/health.html`

### Production Deployment
- [ ] Push to `main` branch triggers deploy-prod.yml
- [ ] Tests pass for all services
- [ ] Docker images built and pushed to ECR
- [ ] Docker compose file copied to EC2 instances
- [ ] db-init folder copied to EC2 instances
- [ ] Environment variables file (.env) exists on EC2
- [ ] Docker compose pull executed successfully
- [ ] Docker compose up executed successfully
- [ ] Health checks pass:
  - [ ] API Gateway: `curl http://localhost:3000/health`
  - [ ] Frontend: `curl http://localhost/health.html`

## Post-Deployment Verification

### Service Health
- [ ] All containers running: `docker compose ps`
- [ ] API Gateway healthy: `curl http://localhost:3000/health`
- [ ] Frontend healthy: `curl http://localhost/health.html`
- [ ] Backend services healthy (internal network)
- [ ] Database services healthy
- [ ] RabbitMQ healthy

### Functional Testing
- [ ] User can access frontend via ALB/Load Balancer
- [ ] User can login successfully
- [ ] User can view laboratories
- [ ] User can create reservation
- [ ] User receives notifications
- [ ] WebSocket connection works
- [ ] API routes work through API Gateway:
  - [ ] `/api/auth/*` → Auth Service
  - [ ] `/api/laboratories/*` → Laboratory Service
  - [ ] `/api/reservations/*` → Reservation Service
  - [ ] `/api/notifications/*` → Notification Service

### Security Verification
- [ ] Backend services not accessible externally (no port mappings)
- [ ] Only ports 80 and 3000 exposed
- [ ] API Gateway is single entry point
- [ ] JWT validation working
- [ ] CORS configured correctly

### Monitoring
- [ ] CloudWatch metrics collecting
- [ ] ALB health checks passing
- [ ] ASG instances healthy
- [ ] No error logs in CloudWatch
- [ ] Application logs visible

### Rollback Plan
- [ ] Previous image tags available in ECR
- [ ] Rollback procedure documented
- [ ] Database backup available (if needed)
- [ ] Rollback tested in QA environment

## Troubleshooting Commands

### Check Container Status
```bash
docker compose ps
docker compose logs api-gateway-qa
docker compose logs frontend-qa
```

### Check Health
```bash
curl http://localhost:3000/health
curl http://localhost/health.html
```

### Check Network
```bash
docker network inspect uce-qa-network
docker network inspect uce-prod-network
```

### Check Logs
```bash
docker compose logs -f api-gateway-qa
docker compose logs -f auth-service-qa
docker compose logs -f frontend-qa
```

### Restart Services
```bash
docker compose -f docker-compose.qa.yml restart api-gateway-qa
docker compose -f docker-compose.qa.yml restart frontend-qa
```

## Sign-off

- [ ] QA Deployment verified by: _______________ Date: _______
- [ ] Production Deployment verified by: _______________ Date: _______
- [ ] Post-deployment testing completed by: _______________ Date: _______
