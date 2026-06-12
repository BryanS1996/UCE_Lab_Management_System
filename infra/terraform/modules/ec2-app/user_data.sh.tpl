#!/bin/bash
set -euxo pipefail

dnf update -y
# docker-compose-plugin ships in the same repo as docker on Amazon Linux 2023
dnf install -y docker docker-compose-plugin aws-cli git
systemctl enable docker
systemctl start docker
usermod -aG docker ec2-user

# Verify Compose plugin is available (sanity check)
docker compose version

mkdir -p /home/ec2-user/app
chown -R ec2-user:ec2-user /home/ec2-user/app

echo "UCE Lab app server (${environment}) listo para deploy via GitHub Actions" > /home/ec2-user/app/README.txt
