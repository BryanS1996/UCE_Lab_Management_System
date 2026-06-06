# Terraform — UCE Lab Management System

Infraestructura como código para AWS Academy.

## Estructura Modular

```
modules/
  ec2/     ← instancias EC2
  rds/     ← PostgreSQL RDS
  vpc/     ← red y subnets
  iam/     ← roles y permisos
environments/
  qa/      ← ambiente QA en AWS
  prod/    ← ambiente Producción en AWS
```

## Uso

```bash
# QA
cd environments/qa
terraform init
terraform plan -var="db_password=xxx" -var="jwt_secret=xxx" -var="key_pair_name=uce-lab-key"
terraform apply ...

# Prod
cd environments/prod
terraform init && terraform apply ...
```

## Estado

Pendiente de implementación completa de módulos para el sprint de despliegue AWS.
