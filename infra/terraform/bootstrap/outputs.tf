output "state_bucket" {
  description = "Configurar como variable TF_STATE_BUCKET en GitHub Environment"
  value       = aws_s3_bucket.tfstate.bucket
}

output "lock_table" {
  description = "Configurar como variable TF_LOCK_TABLE en GitHub Environment"
  value       = aws_dynamodb_table.tflock.name
}

output "backend_config" {
  description = "Valores para backend.hcl o GitHub Actions"
  value = {
    bucket         = aws_s3_bucket.tfstate.bucket
    dynamodb_table = aws_dynamodb_table.tflock.name
    region         = var.aws_region
    encrypt        = true
  }
}

output "github_variables" {
  description = "Copiar a Settings → Environments → Variables"
  value = {
    TF_STATE_BUCKET = aws_s3_bucket.tfstate.bucket
    TF_LOCK_TABLE    = aws_dynamodb_table.tflock.name
    TF_AWS_REGION    = var.aws_region
  }
}
