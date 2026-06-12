# Bootstrap: crear bucket S3 + tabla DynamoDB para estado remoto.
# Ejecutar UNA VEZ por cuenta AWS (QA y Prod por separado).
# Usa backend local; no depende de otro estado remoto.

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile != "" ? var.aws_profile : null
}

data "aws_caller_identity" "current" {}

locals {
  bucket_name = coalesce(
    var.bucket_name,
    "${var.project_name}-tfstate-${data.aws_caller_identity.current.account_id}-${var.environment}"
  )
  lock_table_name = coalesce(
    var.lock_table_name,
    "${var.project_name}-tflock-${var.environment}"
  )
}

resource "aws_s3_bucket" "tfstate" {
  bucket = local.bucket_name

  tags = {
    Name        = local.bucket_name
    Environment = var.environment
    Purpose     = "terraform-state"
  }
}

resource "aws_s3_bucket_versioning" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
