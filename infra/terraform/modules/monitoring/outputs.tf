output "asg_cpu_alarm_arn" {
  description = "ARN of the ASG CPU utilization alarm (null when asg_name is not provided)"
  value       = var.asg_name != "" ? aws_cloudwatch_metric_alarm.asg_cpu_high[0].arn : null
}

output "asg_status_check_alarm_arn" {
  description = "ARN of the ASG status check alarm (null when asg_name is not provided)"
  value       = var.asg_name != "" ? aws_cloudwatch_metric_alarm.asg_status_check[0].arn : null
}

output "alb_5xx_alarm_arn" {
  description = "ARN of the ALB 5XX error alarm (null when alb_arn is not provided)"
  value       = var.create_alb_alarms ? aws_cloudwatch_metric_alarm.alb_5xx_errors[0].arn : null
}

output "alb_response_time_alarm_arn" {
  description = "ARN of the ALB response time alarm (null when alb_arn is not provided)"
  value       = var.create_alb_alarms ? aws_cloudwatch_metric_alarm.alb_target_response_time[0].arn : null
}
