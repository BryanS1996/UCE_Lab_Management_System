locals {
  service_repos = [
    "uce-auth-service",
    "uce-reservation-service",
    "uce-laboratory-service",
    "uce-notification-service",
  ]
  service_ports    = [3000, 3001, 3002, 3003]
  api_gateway_port = 3000
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
  public_subnet_ids = [module.vpc.public_subnet_id]
  ec2_instance_ids  = [module.app.instance_id]
  target_port       = local.api_gateway_port
  health_check_path = "/health"
}

module "app" {
  source = "../../modules/ec2-app"

  environment               = var.environment
  project_name              = var.project_name
  vpc_id                    = module.vpc.vpc_id
  subnet_id                 = module.vpc.private_subnet_ids[0]
  instance_type             = var.ec2_instance_type
  key_pair_name             = var.key_pair_name
  allowed_service_ports     = local.service_ports
  alb_security_group_id     = module.alb.security_group_id
  bastion_security_group_id = module.bastion.security_group_id
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

  environment      = var.environment
  project_name     = var.project_name
  ec2_instance_ids = [module.app.instance_id]
  alb_arn          = module.alb.alb_arn
  sns_topic_arn    = var.monitoring_sns_topic_arn
}
