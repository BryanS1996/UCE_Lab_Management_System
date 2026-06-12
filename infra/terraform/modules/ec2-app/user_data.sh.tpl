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

echo "UCE Lab app server (${environment}) listo para deploy via GitHub Actions" > /home/ec2-user/app/README.txt