variable "environment" {
  type = string
}

variable "project_name" {
  type    = string
  default = "uce-lab"
}

variable "cidr_block" {
  type    = string
  default = "10.0.0.0/16"
}

variable "availability_zone" {
  type    = string
  default = "us-east-1a"
}

variable "availability_zone_secondary" {
  type    = string
  default = "us-east-1b"
}

variable "enable_private_subnets" {
  type        = bool
  description = "Habilitar subredes privadas (requerido si enable_rds = true)"
  default     = false
}
