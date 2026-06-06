#!/bin/bash
# Script de backup de bases de datos
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/$DATE"
mkdir -p $BACKUP_DIR

echo "=== Backup $DATE ==="

docker exec auth-db pg_dump -U authuser auth_service > "$BACKUP_DIR/auth_service.sql"
docker exec reservation-db pg_dump -U reservationuser reservation_service > "$BACKUP_DIR/reservation_service.sql"

echo "Backups guardados en $BACKUP_DIR"
