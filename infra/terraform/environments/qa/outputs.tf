output "ec2_public_ip" {
  description = "IP para GitHub Secret QA_EC2_HOST"
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
  description = "Solo si enable_rds = true"
  value       = var.enable_rds ? module.rds[0].endpoint : null
}

output "github_secrets_hint" {
  description = "Valores a configurar en GitHub tras el apply"
  value = {
    QA_EC2_HOST = module.app.public_ip
    ECR_REPOS   = join(", ", local.service_repos)
  }
}
