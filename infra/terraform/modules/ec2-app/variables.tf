variable "environment" {
  type = string
}

variable "project_name" {
  type    = string
  default = "uce-lab"
}

variable "vpc_id" {
  type = string
}

variable "subnet_id" {
  type = string
}

variable "instance_type" {
  type    = string
  default = "t2.micro"
}

variable "key_pair_name" {
  type        = string
  description = "Nombre del key pair creado en la consola AWS"
}

variable "iam_instance_profile" {
  type        = string
  description = "Perfil IAM de la instancia (AWS Academy: LabInstanceProfile)"
  default     = "LabInstanceProfile"
}

variable "allowed_service_ports" {
  type        = list(number)
  description = "Puertos expuestos de los microservicios"
}

variable "allowed_cidr_blocks" {
  type        = list(string)
  description = "CIDRs permitidos para trafico HTTP de microservicios"
  default     = ["0.0.0.0/0"]
}

variable "ssh_cidr_blocks" {
  type        = list(string)
  description = "CIDRs permitidos para SSH (restringir en produccion)"
  default     = ["0.0.0.0/0"]
}

variable "root_volume_size" {
  type    = number
  default = 20
}

variable "allocate_eip" {
  type        = bool
  description = "Asignar Elastic IP estable para GitHub Secrets"
  default     = true
}
