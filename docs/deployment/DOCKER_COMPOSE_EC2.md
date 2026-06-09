# 🐳 Docker Compose Deployment — AWS EC2

Este documento describe cómo desplegar los microservicios en la instancia EC2 usando **Docker Compose** con imágenes de **Docker Hub**.

---

## 📋 Requisitos

### Instancia EC2
- **SO**: Amazon Linux 2 o Ubuntu 20.04+
- **Espacios en disco**: Mínimo 20 GB disponibles
- **Usuarios requeridos**: `ec2-user` (Linux) o `ubuntu` (Ubuntu)
- **Puertos abiertos** (Security Group):
  - `3000-3003`: Microservicios
  - `5432`: PostgreSQL (si no usas RDS)
  - `5672`: RabbitMQ
  - `22`: SSH

### Software requerido
```bash
# Docker
sudo yum update -y
sudo yum install -y docker

# Docker Compose (v2.x)
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Git
sudo yum install -y git

# Iniciar Docker
sudo systemctl start docker
sudo usermod -aG docker ec2-user
```

---

## 🔧 Configuración en EC2

### 1️⃣ Clonar repositorio

```bash
cd /home/ec2-user
git clone https://github.com/tuuser/UCE_Lab_Management_System.git
cd UCE_Lab_Management_System
```

### 2️⃣ Crear archivo `.env` según el ambiente

#### Para **PRODUCCIÓN** (`.env.prod`)

```bash
cat > /root/.env.prod << 'EOF'
# ===== PRODUCCIÓN =====
NODE_ENV=production

# AUTH Service
AUTH_DB_HOST=<RDS-ENDPOINT-PROD>
AUTH_DB_USER=authuser
AUTH_DB_PASS=<STRONG-PASSWORD>

# RESERVATION Service
RESERVATION_DB_HOST=<RDS-ENDPOINT-PROD>
RESERVATION_DB_USER=reservationuser
RESERVATION_DB_PASS=<STRONG-PASSWORD>

# LABORATORY Service
LAB_DB_HOST=<RDS-ENDPOINT-PROD>
LAB_DB_USER=labuser
LAB_DB_PASS=<STRONG-PASSWORD>

# NOTIFICATION Service
NOTIF_DB_HOST=<RDS-ENDPOINT-PROD>
NOTIF_DB_USER=notifuser
NOTIF_DB_PASS=<STRONG-PASSWORD>

# Secretos generales
JWT_SECRET=<GENERATE-RANDOM-SECRET>
CORS_ORIGIN=https://yourdomain.com
RABBITMQ_URL=amqp://guest:guest@rabbitmq-prod:5672

EOF
```

#### Para **QA** (`.env.qa`)

```bash
cat > /root/.env.qa << 'EOF'
# ===== QA (Docker en EC2) =====
NODE_ENV=qa

# No necesitas valores, usan localhost/contenedores
# Los servicios de BD y RabbitMQ corren en Docker

EOF
```

### 3️⃣ Hacer ejecutable el script de deployment

```bash
chmod +x /home/ec2-user/UCE_Lab_Management_System/scripts/deploy-docker-compose.sh
```

---

## 🚀 Desplegar Microservicios

### Opción A: Deployment PRODUCCIÓN (con RDS externo)

```bash
cd /home/ec2-user/UCE_Lab_Management_System

./scripts/deploy-docker-compose.sh prod /root/.env.prod
```

**¿Qué hace?**
1. Carga variables desde `.env.prod`
2. Ejecuta `docker-compose pull` → Descarga imágenes `bryanfabricio96/*:prod` desde Docker Hub
3. Detiene servicios antiguos (si existen)
4. Ejecuta `docker-compose up -d` → Inicia servicios en background
5. Verifica que estén corriendo

### Opción B: Deployment QA (con BD en Docker)

```bash
./scripts/deploy-docker-compose.sh qa /root/.env.qa
```

**¿Qué hace?**
1. Carga variables desde `.env.qa`
2. Ejecuta `docker-compose pull` → Descarga imágenes `bryanfabricio96/*:qa`
3. Inicia **todos los servicios**: BD PostgreSQL, RabbitMQ, y microservicios
4. Espera 10s a que se estabilicen
5. Muestra estado de contenedores

---

## 📊 Verificar Servicios

### Ver estado
```bash
docker-compose -f docker-compose.prod.yml ps
```

### Ver logs
```bash
# Todos los servicios
docker-compose -f docker-compose.prod.yml logs -f

# Un servicio específico
docker-compose -f docker-compose.prod.yml logs -f auth-service

# Últimas 50 líneas
docker-compose -f docker-compose.prod.yml logs --tail=50
```

### Verificar salud
```bash
# Todos los endpoints
curl http://localhost:3000/health  # Auth
curl http://localhost:3001/health  # Reservation
curl http://localhost:3002/health  # Laboratory
curl http://localhost:3003/health  # Notification
```

---

## 🔄 Actualizar a Nueva Versión

Cuando se publican nuevas imágenes en Docker Hub (con tag `prod` o `qa`):

```bash
# Solo descargar e iniciar (sin para)
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# O usar el script completo
./scripts/deploy-docker-compose.sh prod /root/.env.prod
```

---

## 🛑 Detener Servicios

### Detener sin eliminar volúmenes
```bash
docker-compose -f docker-compose.prod.yml stop
```

### Detener y eliminar contenedores (mantiene datos en volúmenes)
```bash
docker-compose -f docker-compose.prod.yml down
```

### Detener y eliminar TODO (⚠️ Pierde datos)
```bash
docker-compose -f docker-compose.prod.yml down -v
```

---

## 🔐 Integración con GitHub Actions

El workflow `terraform-apply.yml` ejecuta automáticamente:

```bash
#!/bin/bash
ssh -i ~/.ssh/uce-prod.pem ec2-user@<PROD-EC2-IP> << 'DEPLOY'
  cd /home/ec2-user/UCE_Lab_Management_System
  git pull origin main
  chmod +x scripts/deploy-docker-compose.sh
  ./scripts/deploy-docker-compose.sh prod /root/.env.prod
DEPLOY
```

Así que **no necesitas hacer nada manualmente** después de hacer merge a `main` o `qa`.

---

## 🐛 Troubleshooting

### Problema: `docker-compose: command not found`
```bash
# Verificar instalación
docker-compose --version

# Si no está instalado:
sudo curl -L https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-Linux-x86_64 -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Problema: Contenedor no inicia
```bash
# Ver logs detallados
docker-compose -f docker-compose.prod.yml logs auth-service

# Posibles causas:
# - Variables de entorno faltantes (.env no cargado)
# - Puerto ya en uso
# - BD no alcanzable
```

### Problema: Servicios se reinician constantemente
```bash
# Ver si hay errores en el health check
docker ps --no-trunc
docker logs <CONTAINER_ID>

# Aumentar timeout en docker-compose si es lento:
# Editar docker-compose.prod.yml → healthcheck.timeout
```

### Problema: BD no acepta conexión
```bash
# Verificar que RDS está accesible
telnet <RDS-HOST> 5432

# Si está en security group, verificar:
# - DB Security Group permite puerto 5432 desde EC2
# - EC2 Security Group permite outbound a puerto 5432
```

---

## 📚 Archivos Relevantes

- **Docker Compose (PROD)**: `docker-compose.prod.yml`
- **Docker Compose (QA)**: `docker-compose.qa.yml`
- **Script deployment**: `scripts/deploy-docker-compose.sh`
- **Variables producción**: `/root/.env.prod` (crear manualmente)
- **Variables QA**: `/root/.env.qa` (crear manualmente)

---

## 🎯 Flujo Completo (Resumen)

```
1. Desarrollador hace push a 'main' o 'qa'
                ↓
2. GitHub Actions CI/CD:
   - Valida lint y tests
   - Publica imágenes a Docker Hub (tags: prod, qa)
   - Ejecuta Terraform
                ↓
3. Terraform toma imagen_tag desde GitHub Actions
                ↓
4. EC2 recibe SSH command (desde GitHub Actions) para ejecutar:
   ./scripts/deploy-docker-compose.sh prod /root/.env.prod
                ↓
5. Script hace docker pull del tag correcto
                ↓
6. Servicios nuevos están corriendo en EC2
```

---

**¿Preguntas?** Revisa los logs con: `docker-compose logs -f`
