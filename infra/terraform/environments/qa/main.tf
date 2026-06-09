locals {
  service_repos = [
    "uce-auth-service",
    "uce-reservation-service",
    "uce-laboratory-service",
    "uce-notification-service",
  ]
  service_ports = [3010, 3011, 3012, 3013]
}

module "vpc" {
  source = "../../modules/vpc"

  environment            = var.environment
  project_name           = var.project_name
  cidr_block             = var.vpc_cidr
  enable_private_subnets = var.enable_rds
}

module "ecr" {
  source = "../../modules/ecr"

  environment      = var.environment
  repository_names = local.service_repos
}

module "app" {
  source = "../../modules/ec2-app"

  environment           = var.environment
  project_name          = var.project_name
  vpc_id                = module.vpc.vpc_id
  subnet_id             = module.vpc.public_subnet_id
  instance_type         = var.ec2_instance_type
  key_pair_name         = var.key_pair_name
  iam_instance_profile  = var.iam_instance_profile
  allowed_service_ports = local.service_ports
  ssh_cidr_blocks       = var.ssh_cidr_blocks
  allocate_eip          = var.allocate_eip
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
