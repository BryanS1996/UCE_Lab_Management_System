#!/bin/bash
set -euxo pipefail

# --- 1. Crear 2GB de memoria Swap usando 'dd' ---
dd if=/dev/zero of=/swapfile bs=1M count=2048
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile swap swap defaults 0 0' >> /etc/fstab

# --- 2. Actualizar e instalar dependencias base ---
dnf update -y
dnf install -y docker aws-cli git

# Iniciar Docker
systemctl enable docker
systemctl start docker
usermod -aG docker ec2-user

# --- 3. Instalar Docker Compose v2 manualmente ---
mkdir -p /usr/libexec/docker/cli-plugins
curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m)" -o /usr/libexec/docker/cli-plugins/docker-compose
chmod +x /usr/libexec/docker/cli-plugins/docker-compose

# Verificar que el plugin de Compose funcione
docker compose version

# --- 4. Preparar el directorio de la app ---
mkdir -p /home/ec2-user/app
chown -R ec2-user:ec2-user /home/ec2-user/app

# --- 5. Auto-Healing: Login a ECR y levantar contenedores iniciales ---
# Login a ECR usando el perfil IAM de la instancia
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ${ecr_registry}

# Crear docker-compose básico para auto-healing
cat > /home/ec2-user/app/docker-compose.autoheal.yml <<'EOF'
version: '3.8'
services:
  auth-service:
    image: ${ecr_registry}/uce-auth-service:latest
    container_name: auth-service-autoheal
    ports:
      - "3010:3010"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3010/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  reservation-service:
    image: ${ecr_registry}/uce-reservation-service:latest
    container_name: reservation-service-autoheal
    ports:
      - "3011:3011"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3011/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  laboratory-service:
    image: ${ecr_registry}/uce-laboratory-service:latest
    container_name: laboratory-service-autoheal
    ports:
      - "3012:3012"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3012/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  notification-service:
    image: ${ecr_registry}/uce-notification-service:latest
    container_name: notification-service-autoheal
    ports:
      - "3013:3013"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3013/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    image: ${ecr_registry}/uce-frontend:latest
    container_name: frontend-autoheal
    ports:
      - "80:80"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health.html"]
      interval: 30s
      timeout: 10s
      retries: 3
EOF

# Pull y levantar contenedores para auto-healing
cd /home/ec2-user/app
docker compose -f docker-compose.autoheal.yml pull
docker compose -f docker-compose.autoheal.yml up -d

echo "UCE Lab app server (${environment}) inicializado con auto-healing via ECR" > /home/ec2-user/app/README.txt