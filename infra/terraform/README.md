# Terraform — UCE Lab Management System

Infraestructura AWS para **dos cuentas educativas** (QA y Producción) con instancias **t2.micro**.

## Qué crea cada ambiente

| Recurso | QA | Producción |
|---------|-----|------------|
| VPC + subred pública | ✅ | ✅ |
| EC2 t2.micro (Docker) | ✅ puertos 3010–3013 | ✅ puertos 3000–3003 |
| Elastic IP | ✅ | ✅ |
| ECR (4 repos) | ✅ | ✅ |
| RDS PostgreSQL | Opcional (`enable_rds=false` por defecto) | Opcional (`enable_rds=true` por defecto) |

## Estructura

```
infra/terraform/
├── bootstrap/     # S3 + DynamoDB para estado remoto (una vez por cuenta)
├── modules/
│   ├── vpc/       # Red, IGW, subnets
│   ├── ec2-app/   # EC2 + SG + user_data (Docker)
│   ├── ecr/       # Repositorios de imágenes
│   └── rds/       # PostgreSQL (opcional)
├── scripts/
│   └── init-backend.sh
└── environments/
    ├── qa/        # Cuenta AWS QA
    └── prod/      # Cuenta AWS Producción
```

> La carpeta legacy `enviroments/` (typo) quedó obsoleta. Usa `environments/`.

## Requisitos previos (AWS Academy)

1. **Dos cuentas AWS** (QA y Prod) con credenciales de laboratorio.
2. **Key Pair** en cada cuenta (Consola → EC2 → Key Pairs).
3. **LabInstanceProfile** disponible (viene con AWS Academy Learner Lab).
4. Perfiles locales en `~/.aws/credentials`:

```ini
[qa]
aws_access_key_id = ...
aws_secret_access_key = ...
aws_session_token = ...

[prod]
aws_access_key_id = ...
aws_secret_access_key = ...
aws_session_token = ...
```

## Paso 0 — Backend S3 (obligatorio para GitHub Actions)

El estado de Terraform se guarda en **S3** con bloqueo en **DynamoDB**.

### Opción A — Desde GitHub Actions (recomendado)

1. Ve a **Actions → Terraform — Bootstrap S3 Backend → Run workflow**
2. Ejecuta con `qa` (cuenta QA) y luego con `prod` (cuenta Prod)
3. Copia las variables del resumen a **Settings → Environments**:

| Environment | Variables |
|-------------|-----------|
| `qa` | `TF_STATE_BUCKET`, `TF_LOCK_TABLE`, `TF_AWS_REGION=us-east-1` |
| `production` | `TF_STATE_BUCKET`, `TF_LOCK_TABLE`, `TF_AWS_REGION=us-east-1` |

### Opción B — Local

```bash
# Cuenta QA
cd infra/terraform/bootstrap
cp terraform.tfvars.example terraform.tfvars   # environment = "qa", aws_profile = "qa"
terraform init && terraform apply

# Copiar outputs a backend.hcl
cd ../environments/qa
cp backend.hcl.example backend.hcl
# Pegar bucket y dynamodb_table del output de bootstrap

# Repetir en cuenta Prod con environment = "prod"
```

## Uso local

### QA

```bash
cd infra/terraform/environments/qa
cp terraform.tfvars.example terraform.tfvars
# Editar key_pair_name y aws_profile = "qa"
cp backend.hcl.example backend.hcl   # tras bootstrap

bash ../../scripts/init-backend.sh qa
terraform plan
terraform apply
```

### Producción

```bash
cd infra/terraform/environments/prod
cp terraform.tfvars.example terraform.tfvars
cp backend.hcl.example backend.hcl

bash ../../scripts/init-backend.sh prod
terraform plan
terraform apply
```

### Outputs importantes

Tras `terraform apply`, copia los valores a GitHub Secrets:

| Output Terraform | GitHub Secret |
|------------------|---------------|
| `ec2_public_ip` (QA) | `QA_EC2_HOST` |
| `ec2_public_ip` (Prod) | `PROD_EC2_HOST` |
| Clave `.pem` del key pair | `EC2_SSH_PRIVATE_KEY` |

## GitHub Actions (automático)

| Evento | Workflow | Cuenta AWS |
|--------|----------|------------|
| PR → `qa` (cambios en `infra/terraform/`) | `terraform-plan-qa.yml` | QA |
| Push → `qa` | `terraform-apply-qa.yml` | QA |
| PR → `main` | `terraform-plan.yml` | Prod |
| Push → `main` | `terraform-apply.yml` | Prod |

### Variables y secrets en GitHub

**Environment `qa`** (secrets de la cuenta QA):

| Nombre | Tipo | Descripción |
|--------|------|-------------|
| `AWS_ACCESS_KEY_ID` | Secret | Credenciales cuenta QA |
| `AWS_SECRET_ACCESS_KEY` | Secret | |
| `AWS_SESSION_TOKEN` | Secret | Si usas Learner Lab |
| `EC2_SSH_PRIVATE_KEY` | Secret | Contenido del `.pem` |
| `DB_PASSWORD` | Secret | Solo si `enable_rds=true` |

**Variables por Environment** (tras bootstrap):

| Nombre | Ejemplo |
|--------|---------|
| `TF_STATE_BUCKET` | `uce-lab-tfstate-123456789012-qa` |
| `TF_LOCK_TABLE` | `uce-lab-tflock-qa` |
| `TF_AWS_REGION` | `us-east-1` |
| `TF_KEY_PAIR_NAME` | `uce-lab-qa-key` |

**Environment `production`** (secrets de la cuenta Prod): mismos nombres + `JWT_SECRET`.

Los workflows `terraform-plan*.yml` y `terraform-apply*.yml` usan el backend S3 automaticamente. Si faltan las variables, el pipeline falla con un mensaje claro.

## Configurar EC2 tras Terraform

1. Terraform crea la instancia con Docker instalado.
2. GitHub Actions (`deploy-qa.yml` / `deploy-prod.yml`) copia el compose y despliega imágenes ECR.
3. En **Prod con RDS**, crea en PostgreSQL las bases: `auth_service`, `reservation_service`, `laboratory_service`, `notification_service` y configura `/home/ec2-user/app/.env`.

## Nota sobre t2.micro

1 GB RAM es justo para 4 microservicios + Postgres en Docker. Para QA puedes:
- Desplegar solo auth + reservation primero, o
- Usar `enable_rds=true` y RDS `db.t3.micro` para liberar RAM en el EC2.

## Destruir infraestructura

```bash
terraform destroy
```
