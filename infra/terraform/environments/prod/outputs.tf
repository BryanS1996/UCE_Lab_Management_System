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

# app_private_ip and ec2_instance_id are removed — the ASG manages a dynamic fleet.
# Use asg_name to query running instances via:
#   aws autoscaling describe-auto-scaling-groups --auto-scaling-group-names <asg_name>

output "asg_name" {
  description = "Auto Scaling Group name — use to discover running EC2 instances"
  value       = module.app.asg_name
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
    PROD_ALB_DNS           = module.alb.alb_dns_name
    PROD_BASTION_PUBLIC_IP = module.bastion.public_ip
    PROD_ASG_NAME          = module.app.asg_name
    ECR_REPOS              = join(", ", local.service_repos)
    RDS_ENDPOINT           = var.enable_rds ? module.rds[0].endpoint : "PostgreSQL in Docker"
    NOTE                   = "PROD_APP_PRIVATE_IP is no longer static — SSH via Bastion to any ASG instance"
  }
}
