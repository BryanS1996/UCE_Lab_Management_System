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
}

variable "iam_instance_profile" {
  type    = string
  default = "LabInstanceProfile"
}

variable "ssh_cidr_blocks" {
  type        = list(string)
  description = "Restringir a tu IP en produccion: [\"x.x.x.x/32\"]"
  default     = ["0.0.0.0/0"]
}

variable "allocate_eip" {
  type    = bool
  default = true
}

variable "enable_rds" {
  type        = bool
  description = "false = Postgres en Docker (recomendado AWS Academy QA)"
  default     = false
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
