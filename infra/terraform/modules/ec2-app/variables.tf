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

# Changed from subnet_id (single) to subnet_ids (list) for multi-AZ ASG placement
variable "subnet_ids" {
  type        = list(string)
  description = "List of private subnet IDs where the ASG will launch instances"
}

variable "instance_type" {
  type    = string
  default = "t2.micro"
}

variable "key_pair_name" {
  type        = string
  description = "Key pair name for SSH access"
}

variable "allowed_service_ports" {
  type        = list(number)
  description = "Puertos expuestos de los microservicios"
}

variable "alb_security_group_id" {
  type        = string
  description = "Security Group ID of the ALB"
}

variable "bastion_security_group_id" {
  type        = string
  description = "Security Group ID of the Bastion Host"
}

variable "target_group_arn" {
  type        = string
  description = "ARN of the ALB Target Group to attach the ASG to"
}

variable "root_volume_size" {
  type    = number
  default = 20
}

# ─── ASG Sizing ────────────────────────────────────────────────────────────────
variable "min_size" {
  type        = number
  description = "Minimum number of instances in the ASG"
  default     = 1
}

variable "desired_capacity" {
  type        = number
  description = "Desired number of instances in the ASG"
  default     = 2
}

variable "max_size" {
  type        = number
  description = "Maximum number of instances in the ASG"
  default     = 4
}
