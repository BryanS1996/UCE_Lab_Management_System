variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "aws_profile" {
  type        = string
  description = "Perfil AWS local. Vacio en GitHub Actions."
  default     = ""
}

variable "environment" {
  type    = string
  default = "prod"
}

variable "project_name" {
  type    = string
  default = "uce-lab"
}

variable "vpc_cidr" {
  type    = string
  default = "10.1.0.0/16"
}

variable "ec2_instance_type" {
  type    = string
  default = "t2.micro"
}

variable "key_pair_name" {
  type        = string
  description = "Key pair creado en la consola AWS de la cuenta PROD"
}

variable "iam_instance_profile" {
  type    = string
  default = "LabInstanceProfile"
}

variable "ssh_cidr_blocks" {
  type    = list(string)
  default = ["0.0.0.0/0"]
}

variable "allocate_eip" {
  type    = bool
  default = true
}

variable "enable_rds" {
  type        = bool
  description = "true = RDS PostgreSQL para docker-compose.prod.yml"
  default     = true
}

variable "db_instance_class" {
  type    = string
  default = "db.t3.micro"
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "jwt_secret" {
  type        = string
  sensitive   = true
  description = "Referencia para documentacion; configurar en .env del EC2"
}
