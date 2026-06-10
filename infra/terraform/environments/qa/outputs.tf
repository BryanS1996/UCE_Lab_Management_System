output "alb_dns_name" {
  description = "ALB DNS name for Cloudflare CNAME"
  value       = module.alb.alb_dns_name
}

output "alb_zone_id" {
  description = "ALB Route 53 zone ID"
  value       = module.alb.alb_zone_id
}

output "bastion_public_ip" {
  description = "Bastion Host public IP for SSH access"
  value       = module.bastion.public_ip
}

output "app_private_ip" {
  description = "EC2 instance private IP"
  value       = module.app.private_ip
}

output "ec2_instance_id" {
  value = module.app.instance_id
}

output "ecr_repository_urls" {
  value = module.ecr.repository_urls
}

output "ecr_registry_id" {
  value = module.ecr.registry_id
}

output "rds_endpoint" {
  description = "RDS endpoint (only if enable_rds = true)"
  value       = var.enable_rds ? module.rds[0].endpoint : null
}

output "rds_address" {
  description = "RDS address (only if enable_rds = true)"
  value       = var.enable_rds ? module.rds[0].address : null
}

output "rds_port" {
  description = "RDS port (only if enable_rds = true)"
  value       = var.enable_rds ? module.rds[0].port : null
}

output "github_secrets_hint" {
  description = "Values to configure in GitHub after apply"
  value = {
    QA_ALB_DNS           = module.alb.alb_dns_name
    QA_BASTION_PUBLIC_IP = module.bastion.public_ip
    QA_APP_PRIVATE_IP    = module.app.private_ip
    ECR_REPOS            = join(", ", local.service_repos)
    RDS_ENDPOINT         = var.enable_rds ? module.rds[0].endpoint : "PostgreSQL in Docker"
  }
}
