output "ec2_cpu_alarm_arns" {
  value       = aws_cloudwatch_metric_alarm.ec2_cpu_high[*].arn
  description = "ARNs of EC2 CPU utilization alarms"
}

output "ec2_status_check_alarm_arns" {
  value       = aws_cloudwatch_metric_alarm.ec2_status_check[*].arn
  description = "ARNs of EC2 status check alarms"
}

output "alb_5xx_alarm_arn" {
  value       = var.alb_arn != "" ? aws_cloudwatch_metric_alarm.alb_5xx_errors[0].arn : null
  description = "ARN of ALB 5XX error alarm"
}

output "alb_response_time_alarm_arn" {
  value       = var.alb_arn != "" ? aws_cloudwatch_metric_alarm.alb_target_response_time[0].arn : null
  description = "ARN of ALB response time alarm"
}
