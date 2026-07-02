#!/bin/bash
##############################################################################
# Deploy QA — UCE Lab Management System
#
# Uso:
#   LOCAL (desarrollo):  ./deploy-qa.sh local
#   EC2 (desde GitHub):  ./deploy-qa.sh docker /root/.env.qa
#
# En QA (EC2):
#   - Descarga imágenes desde Docker Hub (tag: qa)
#   - Inicia BD PostgreSQL, RabbitMQ, y microservicios en docker compose
#
# En LOCAL (desarrollo):
#   - Construye imágenes locales (docker build)
#   - Usa BD PostgreSQL en contenedor
##############################################################################

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# ============================================================================
# CONFIGURACIÓN
# ============================================================================

MODE=${1:-local}
ENV_FILE=${2:-}

case "$MODE" in
    local)
        log_info "Iniciando DEPLOY LOCAL (desarrollo) con docker-compose.qa.yml"
        COMPOSE_FILE="docker-compose.qa.yml"
        BUILD_MODE=true
        ;;
    docker)
        if [ -z "$ENV_FILE" ]; then
            log_error "Uso: $0 docker <.env_file>"
            echo "  Ejemplo: $0 docker /root/.env.qa"
        fi
        log_info "Iniciando DEPLOY QA (EC2) con docker-compose.qa.yml"
        COMPOSE_FILE="docker-compose.qa.yml"
        BUILD_MODE=false
        
        # Cargar variables de entorno
        set -a
        source "$ENV_FILE"
        set +a
        log_info "Variables cargadas desde: $ENV_FILE"
        ;;
    *)
        log_error "Modo inválido: $MODE. Use 'local' o 'docker'"
        ;;
esac

# Validar que el compose file existe
if [ ! -f "$COMPOSE_FILE" ]; then
    log_error "No encontrado: $COMPOSE_FILE"
fi

# ============================================================================
# DEPLOYMENT
# ============================================================================

log_info "Usando: $COMPOSE_FILE"

# Validar configuración
docker compose -f "$COMPOSE_FILE" config --quiet

# Detener servicios anteriores
log_info "Deteniendo servicios anteriores..."
docker compose -f "$COMPOSE_FILE" down 2>/dev/null || log_info "No hay servicios anteriores"

# Build o Pull según el modo
if [ "$BUILD_MODE" = true ]; then
    log_info "Construyendo imágenes locales..."
    docker compose -f "$COMPOSE_FILE" build --no-cache
else
    log_info "Descargando imágenes desde Docker Hub (tag: qa)..."
    docker compose -f "$COMPOSE_FILE" pull
fi

# Iniciar servicios
log_info "Iniciando servicios..."
docker compose -f "$COMPOSE_FILE" up -d

log_info "Esperando a que los servicios se estabilicen (15 segundos)..."
sleep 15

# ============================================================================
# VERIFICACIONES
# ============================================================================

log_info "Verificando salud de los servicios..."

HEALTH_CHECKS=(
    "3010:Auth Service QA"
    "3011:Reservation Service QA"
)

FAILED=0
for port_service in "${HEALTH_CHECKS[@]}"; do
    PORT=${port_service%:*}
    SERVICE=${port_service#*:}
    
    if curl -sf http://localhost:$PORT/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} $SERVICE (puerto $PORT): OK"
    else
        echo -e "${YELLOW}✗${NC} $SERVICE (puerto $PORT): No responde (aún iniciando...)"
        FAILED=$((FAILED + 1))
    fi
done

# ============================================================================
# RESUMEN
# ============================================================================

echo ""
log_info "============================================"
if [ $FAILED -eq 0 ]; then
    log_info "✅ DEPLOY QA completado exitosamente"
else
    log_error "⚠️  Algunos servicios aún se están iniciando"
fi
log_info "============================================"

log_info ""
log_info "Próximos pasos:"
log_info "  Ver logs:     docker compose -f $COMPOSE_FILE logs -f"
log_info "  Detener:      docker compose -f $COMPOSE_FILE down"
log_info "  Estado:       docker compose -f $COMPOSE_FILE ps"

