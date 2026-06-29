locals {
  service_repos = [
    "uce-auth-service",
    "uce-reservation-service",
    "uce-laboratory-service",
    "uce-notification-service",
    "uce-catalog-service",
    "uce-payment-service",
    "uce-api-gateway",
    "uce-frontend",
  ]
  # ¡Aquí está el cambio! Agregamos el puerto 80 para permitir el tráfico del Balanceador y el Health Check
  service_ports    = [80, 3010, 3011, 3012, 3013, 3014, 3016]
  
  # ALB forwards public traffic to port 80 (nginx frontend).
  # Nginx serves the React SPA and proxies /api/* calls to the backend services.
  api_gateway_port = 80
}

module "vpc" {
  source = "../../modules/vpc"

  environment  = var.environment
  project_name = var.project_name
  cidr_block   = var.vpc_cidr
}

module "ecr" {
  source = "../../modules/ecr"

  environment      = var.environment
  repository_names = local.service_repos
}

module "bastion" {
  source = "../../modules/bastion"

  environment     = var.environment
  project_name    = var.project_name
  vpc_id          = module.vpc.vpc_id
  subnet_id       = module.vpc.public_subnet_id
  instance_type   = "t3.micro"
  key_pair_name   = var.key_pair_name
  ssh_cidr_blocks = var.ssh_cidr_blocks
}

module "alb" {
  source = "../../modules/alb"

  environment       = var.environment
  project_name      = var.project_name
  vpc_id            = module.vpc.vpc_id
  # Now uses both public subnets for multi-AZ ALB support
  public_subnet_ids = module.vpc.public_subnet_ids
  target_port       = local.api_gateway_port
  # /health.html is served by nginx with a static 200 response.
  # Must match the frontend container's health endpoint, not the NestJS /health.
  health_check_path = "/health.html"
}

module "app" {
  source = "../../modules/ec2-app"

  environment               = var.environment
  project_name              = var.project_name
  vpc_id                    = module.vpc.vpc_id
  # ASG distributes across all private subnets
  subnet_ids                = module.vpc.private_subnet_ids
  instance_type             = var.ec2_instance_type
  key_pair_name             = var.key_pair_name
  allowed_service_ports     = local.service_ports
  alb_security_group_id     = module.alb.security_group_id
  bastion_security_group_id = module.bastion.security_group_id
  # Wire the ALB Target Group ARN so the ASG auto-registers instances
  target_group_arn          = module.alb.target_group_arn
  # ECR registry URL for auto-healing
  ecr_registry              = "${module.ecr.registry_id}.dkr.ecr.us-east-1.amazonaws.com"
  # QA cost optimization: run minimum instances
  min_size                  = 1
  desired_capacity          = 1
  max_size                  = 2
}

module "rds" {
  count  = var.enable_rds ? 1 : 0
  source = "../../modules/rds"

  environment           = var.environment
  project_name          = var.project_name
  vpc_id                = module.vpc.vpc_id
  subnet_ids            = module.vpc.private_subnet_ids
  app_security_group_id = module.app.security_group_id
  instance_class        = var.db_instance_class
  db_password           = var.db_password
}

module "monitoring" {
  source = "../../modules/monitoring"

  environment  = var.environment
  project_name = var.project_name
  # ASG name used as the CloudWatch dimension — aggregates CPU/status metrics
  # across all instances in the group without needing individual instance IDs.
  asg_name           = module.app.asg_name
  alb_arn            = module.alb.alb_arn
  create_alb_alarms  = true
  sns_topic_arn      = var.monitoring_sns_topic_arn
}