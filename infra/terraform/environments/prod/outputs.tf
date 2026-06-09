output "ec2_public_ip" {
  description = "IP para GitHub Secret PROD_EC2_HOST"
  value       = module.app.public_ip
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
  value = var.enable_rds ? module.rds[0].endpoint : null
}

output "rds_address" {
  value = var.enable_rds ? module.rds[0].address : null
}

output "github_secrets_hint" {
  value = {
    PROD_EC2_HOST = module.app.public_ip
    ECR_REPOS     = join(", ", local.service_repos)
  }
}
