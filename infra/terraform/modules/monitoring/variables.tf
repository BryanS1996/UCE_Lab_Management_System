variable "environment" {
  type = string
}

variable "project_name" {
  type    = string
  default = "uce-lab"
}

# Replaced ec2_instance_ids (list) with asg_name (single string).
# CloudWatch ASG-level metrics use AutoScalingGroupName as the dimension,
# which aggregates across all instances in the group automatically.
variable "asg_name" {
  type        = string
  description = "Name of the Auto Scaling Group to monitor. Leave empty to skip EC2/ASG alarms."
  default     = ""
}

variable "alb_arn" {
  type        = string
  description = "ALB ARN to monitor. Leave empty to skip ALB alarms."
  default     = ""
}

variable "create_alb_alarms" {
  type        = bool
  description = "Set to true to create ALB 5XX and response-time alarms. Must be a static value — cannot depend on a resource attribute (Terraform count constraint)."
  default     = false
}


variable "cpu_threshold" {
  type        = number
  description = "CPU utilization threshold percentage for the ASG scale-out alarm"
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
