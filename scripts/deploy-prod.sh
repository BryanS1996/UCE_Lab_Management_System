#!/bin/bash
# Script de deploy a ambiente PRODUCCION
set -e

echo "=== Deploy PROD — UCE Lab Management ==="

docker compose config --quiet
docker compose up -d --build

sleep 20
curl -f http://localhost:3000/health && echo "  Auth Service PROD: OK"
curl -f http://localhost:3001/health && echo "  Reservation Service PROD: OK"
curl -f http://localhost:3002/health && echo "  Laboratory Service PROD: OK"
curl -f http://localhost:3003/health && echo "  Notification Service PROD: OK"

echo "=== Deploy PROD completado ==="
