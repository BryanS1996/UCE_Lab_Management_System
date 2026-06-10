variable "environment" {
  type = string
}

variable "project_name" {
  type    = string
  default = "uce-lab"
}

variable "ec2_instance_ids" {
  type        = list(string)
  description = "List of EC2 instance IDs to monitor"
  default     = []
}

variable "alb_arn" {
  type        = string
  description = "ALB ARN to monitor"
  default     = ""
}

variable "cpu_threshold" {
  type        = number
  description = "CPU utilization threshold percentage"
  default     = 80
}

variable "alb_5xx_threshold" {
  type        = number
  description = "ALB 5XX error count threshold"
  default     = 50
}

variable "alb_response_time_threshold" {
  type        = number
  description = "ALB target response time threshold in seconds"
  default     = 5
}

variable "sns_topic_arn" {
  type        = string
  description = "SNS topic ARN for alarm notifications (optional)"
  default     = ""
}
