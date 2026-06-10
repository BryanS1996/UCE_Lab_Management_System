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

variable "public_subnet_ids" {
  type = list(string)
}

variable "ec2_instance_ids" {
  type = list(string)
}

variable "target_port" {
  type        = number
  description = "Port for the API Gateway (entry point for the application)"
  default     = 3000
}

variable "health_check_path" {
  type        = string
  description = "Health check path for the target group"
  default     = "/health"
}
