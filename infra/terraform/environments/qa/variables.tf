variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "aws_profile" {
  type        = string
  description = "Perfil AWS local (~/.aws/credentials). Vacio en GitHub Actions."
  default     = ""
}

variable "environment" {
  type    = string
  default = "qa"
}

variable "project_name" {
  type    = string
  default = "uce-lab"
}

variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "ec2_instance_type" {
  type    = string
  default = "t2.micro"
}

variable "key_pair_name" {
  type        = string
  description = "Key pair creado en la consola AWS de la cuenta QA"
  # AWS Academy Learner Lab default key pair — available in every session.
  default     = "vockey"
}

variable "iam_instance_profile" {
  type    = string
  default = "LabInstanceProfile"
}

variable "ssh_cidr_blocks" {
  type        = list(string)
  description = "CIDRs permitidos para SSH al Bastion Host"
  default     = ["0.0.0.0/0"]
}

variable "enable_rds" {
  type        = bool
  description = "false = Postgres en Docker (recomendado AWS Academy QA)"
  default     = false
}

variable "monitoring_sns_topic_arn" {
  type        = string
  description = "SNS topic ARN for CloudWatch alarm notifications (optional)"
  default     = ""
}

variable "db_instance_class" {
  type    = string
  default = "db.t3.micro"
}

variable "db_password" {
  type        = string
  sensitive   = true
  description = "Solo requerido si enable_rds = true"
  default     = ""
}

variable "image_tag" {
  type        = string
  default     = "qa"
  description = "Image tag para Docker Hub (prod o qa). Determina qué imágenes descargar en ECS Fargate Task Definition."
}
