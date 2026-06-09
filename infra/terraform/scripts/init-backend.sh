#!/usr/bin/env bash
# Inicializa Terraform con backend S3.
# Uso local:  ./init-backend.sh qa
# Uso CI:     TF_STATE_BUCKET=... TF_LOCK_TABLE=... ./init-backend.sh qa

set -euo pipefail

ENV="${1:?Uso: init-backend.sh <qa|prod>}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_DIR="${SCRIPT_DIR}/../environments/${ENV}"

if [[ ! -d "${ENV_DIR}" ]]; then
  echo "Ambiente invalido: ${ENV}" >&2
  exit 1
fi

STATE_KEY="${ENV}/terraform.tfstate"
REGION="${TF_AWS_REGION:-us-east-1}"

cd "${ENV_DIR}"

if [[ -f backend.hcl ]]; then
  echo "==> terraform init -backend-config=backend.hcl"
  terraform init -backend-config=backend.hcl
  exit 0
fi

if [[ -z "${TF_STATE_BUCKET:-}" || -z "${TF_LOCK_TABLE:-}" ]]; then
  echo "ERROR: Define TF_STATE_BUCKET y TF_LOCK_TABLE, o crea backend.hcl desde backend.hcl.example" >&2
  echo "Ejecuta primero: cd infra/terraform/bootstrap && terraform apply" >&2
  exit 1
fi

echo "==> terraform init (bucket=${TF_STATE_BUCKET}, key=${STATE_KEY})"
terraform init \
  -backend-config="bucket=${TF_STATE_BUCKET}" \
  -backend-config="key=${STATE_KEY}" \
  -backend-config="region=${REGION}" \
  -backend-config="dynamodb_table=${TF_LOCK_TABLE}" \
  -backend-config="encrypt=true"
