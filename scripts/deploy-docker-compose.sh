#!/bin/bash
##############################################################################
# Deploy Microservices usando Docker Compose + Docker Hub
# 
# Uso:
#   ./deploy-docker-compose.sh prod .env.prod    # Deploy PROD
#   ./deploy-docker-compose.sh qa .env.qa        # Deploy QA
#
# Este script:
# 1. Carga variables de entorno desde .env
# 2. Ejecuta docker-compose pull (descarga imágenes del tag correcto)
# 3. Ejecuta docker-compose up (inicia los servicios)
##############################################################################

set -e  # Exit on error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================================================
# FUNCIONES
# ============================================================================

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# ============================================================================
# VALIDACIONES
# ============================================================================

if [ $# -lt 2 ]; then
    log_error "Uso: $0 <prod|qa> <.env_file>"
    echo "Ejemplo:"
    echo "  $0 prod /root/.env.prod"
    echo "  $0 qa /root/.env.qa"
fi

ENVIRONMENT=$1
ENV_FILE=$2

# Validar argumento ENVIRONMENT
if [[ ! "$ENVIRONMENT" =~ ^(prod|qa)$ ]]; then
    log_error "ENVIRONMENT debe ser 'prod' o 'qa', recibido: $ENVIRONMENT"
fi

# Validar que el archivo .env existe
if [ ! -f "$ENV_FILE" ]; then
    log_error "Archivo .env no encontrado: $ENV_FILE"
fi

log_info "Iniciando deployment de $ENVIRONMENT usando $ENV_FILE"

# ============================================================================
# CARGAR VARIABLES DE ENTORNO
# ============================================================================

set -a  # Export all variables
source "$ENV_FILE"
set +a

log_info "Variables de entorno cargadas desde $ENV_FILE"

# ============================================================================
# SELECCIONAR DOCKER-COMPOSE FILE
# ============================================================================

if [ "$ENVIRONMENT" = "prod" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
else
    COMPOSE_FILE="docker-compose.qa.yml"
fi

if [ ! -f "$COMPOSE_FILE" ]; then
    log_error "Archivo no encontrado: $COMPOSE_FILE"
fi

log_info "Usando: $COMPOSE_FILE"

# ============================================================================
# DETENER SERVICIOS ANTIGUOS (SI EXISTEN)
# ============================================================================

log_info "Deteniendo servicios anteriores..."
docker-compose -f "$COMPOSE_FILE" down || log_warn "No hay servicios anteriores para detener"

# ============================================================================
# DESCARGAR IMÁGENES DESDE DOCKER HUB
# ============================================================================

log_info "Descargando imágenes desde Docker Hub (tag: $ENVIRONMENT)..."
docker-compose -f "$COMPOSE_FILE" pull || log_error "Falló al descargar imágenes"

log_info "Imágenes descargadas exitosamente"

# ============================================================================
# INICIAR SERVICIOS
# ============================================================================

log_info "Iniciando servicios en segundo plano..."
docker-compose -f "$COMPOSE_FILE" up -d || log_error "Falló al iniciar servicios"

log_info "Servicios iniciados correctamente"

# ============================================================================
# VERIFICACIONES
# ============================================================================

log_info "Esperando 10 segundos para que los servicios se estabilicen..."
sleep 10

log_info "Estado de los contenedores:"
docker-compose -f "$COMPOSE_FILE" ps

log_info "============================================"
log_info "✅ Deployment completado exitosamente"
log_info "============================================"
log_info "Ambiente: $ENVIRONMENT"
log_info "Docker-Compose: $COMPOSE_FILE"
log_info "Variables cargadas desde: $ENV_FILE"
log_info ""
log_info "Para ver logs en tiempo real:"
log_info "  docker-compose -f $COMPOSE_FILE logs -f"
log_info ""
log_info "Para detener servicios:"
log_info "  docker-compose -f $COMPOSE_FILE down"
