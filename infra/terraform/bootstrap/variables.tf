variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "aws_profile" {
  type        = string
  description = "Perfil AWS local (qa o prod). Vacio en CI."
  default     = ""
}

variable "environment" {
  type        = string
  description = "qa o prod"
}

variable "project_name" {
  type    = string
  default = "uce-lab"
}

variable "bucket_name" {
  type        = string
  description = "Opcional. Por defecto: uce-lab-tfstate-{account_id}-{environment}"
  default     = null
}

variable "lock_table_name" {
  type        = string
  description = "Opcional. Por defecto: uce-lab-tflock-{environment}"
  default     = null
}
