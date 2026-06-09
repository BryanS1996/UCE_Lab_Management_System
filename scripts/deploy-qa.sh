#!/bin/bash
# Script de deploy a ambiente QA
set -e

echo "=== Deploy QA — UCE Lab Management ==="

# Verificar docker compose
docker compose -f docker-compose.qa.yml config --quiet

# Build y levantar
docker compose -f docker-compose.qa.yml up -d --build

# Verificar servicios
echo "Esperando que los servicios inicien..."
sleep 15

curl -f http://localhost:3010/health && echo "  Auth Service QA: OK"
curl -f http://localhost:3011/health && echo "  Reservation Service QA: OK"
curl -f http://localhost:3012/health && echo "  Laboratory Service QA: OK"
curl -f http://localhost:3013/health && echo "  Notification Service QA: OK"

echo "=== Deploy QA completado ==="
