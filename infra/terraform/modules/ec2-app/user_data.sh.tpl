#!/bin/bash
set -euxo pipefail

dnf update -y
dnf install -y docker wget git
systemctl enable docker
systemctl start docker
usermod -aG docker ec2-user

if ! docker compose version >/dev/null 2>&1; then
  mkdir -p /usr/local/lib/docker/cli-plugins
  curl -SL "https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-linux-x86_64" \
    -o /usr/local/lib/docker/cli-plugins/docker-compose
  chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
  ln -sf /usr/local/lib/docker/cli-plugins/docker-compose /usr/local/bin/docker-compose
fi

mkdir -p /home/ec2-user/app
chown -R ec2-user:ec2-user /home/ec2-user/app

echo "UCE Lab app server (${environment}) listo para deploy via GitHub Actions" > /home/ec2-user/app/README.txt
