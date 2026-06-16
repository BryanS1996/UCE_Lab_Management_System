#!/bin/bash
##############################################################################
# Deploy PRODUCCIÓN — UCE Lab Management System
#
# Uso:
#   LOCAL (desarrollo):  ./deploy-prod.sh local
#   EC2 (desde GitHub):  ./deploy-prod.sh docker /root/.env.prod
#
# En PRODUCCIÓN (EC2):
#   - Descarga imágenes pre-construidas desde Docker Hub (tag: prod)
#   - Conecta a RDS externa (DB_HOST desde .env)
#   - Inicia servicios en docker-compose up -d
#
# En LOCAL (desarrollo):
#   - Construye imágenes locales (docker build)
#   - Usa contenedores de BD dentro de docker-compose
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
        log_info "Iniciando DEPLOY LOCAL (desarrollo) con docker-compose.yml"
        COMPOSE_FILE="docker-compose.yml"
        ;;
    docker)
        if [ -z "$ENV_FILE" ]; then
            log_error "Uso: $0 docker <.env_file>"
            echo "  Ejemplo: $0 docker /root/.env.prod"
        fi
        log_info "Iniciando DEPLOY PRODUCCIÓN (EC2) con docker-compose.prod.yml"
        COMPOSE_FILE="docker-compose.prod.yml"
        
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
docker-compose -f "$COMPOSE_FILE" config --quiet

# Detener servicios anteriores
log_info "Deteniendo servicios anteriores..."
docker-compose -f "$COMPOSE_FILE" down 2>/dev/null || log_info "No hay servicios anteriores"

# Build o Pull según el modo
if [ "$MODE" = "local" ]; then
    log_info "Construyendo imágenes locales..."
    docker-compose -f "$COMPOSE_FILE" build --no-cache
else
    log_info "Descargando imágenes desde Docker Hub (tag: prod)..."
    docker-compose -f "$COMPOSE_FILE" pull
fi

# Iniciar servicios
log_info "Iniciando servicios..."
docker-compose -f "$COMPOSE_FILE" up -d

log_info "Esperando a que los servicios se estabilicen (15 segundos)..."
sleep 15

# ============================================================================
# VERIFICACIONES
# ============================================================================

log_info "Verificando salud de los servicios..."

HEALTH_CHECKS=(
    "3000:Auth Service"
    "3001:Reservation Service"
    "3002:Laboratory Service"
    "3003:Notification Service"
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
    log_info "✅ DEPLOY completado exitosamente"
else
    log_error "⚠️  Algunos servicios aún se están iniciando"
fi
log_info "============================================"

log_info ""
log_info "Próximos pasos:"
log_info "  Ver logs:     docker-compose -f $COMPOSE_FILE logs -f"
log_info "  Detener:      docker-compose -f $COMPOSE_FILE down"
log_info "  Estado:       docker-compose -f $COMPOSE_FILE ps"

