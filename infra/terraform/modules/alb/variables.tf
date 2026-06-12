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
  type        = list(string)
  description = "List of public subnet IDs for the ALB (minimum 2, in different AZs)"
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
