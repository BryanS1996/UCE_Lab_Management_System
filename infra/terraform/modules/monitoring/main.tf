resource "aws_cloudwatch_metric_alarm" "ec2_cpu_high" {
  count               = length(var.ec2_instance_ids)
  alarm_name          = "${var.project_name}-ec2-cpu-high-${var.environment}-${count.index}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "300"
  statistic           = "Average"
  threshold           = var.cpu_threshold
  alarm_description   = "This metric monitors EC2 CPU utilization"
  alarm_actions       = var.sns_topic_arn != "" ? [var.sns_topic_arn] : []

  dimensions {
    InstanceId = var.ec2_instance_ids[count.index]
  }

  tags = {
    Name        = "${var.project_name}-ec2-cpu-high-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_cloudwatch_metric_alarm" "ec2_status_check" {
  count               = length(var.ec2_instance_ids)
  alarm_name          = "${var.project_name}-ec2-status-check-${var.environment}-${count.index}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "StatusCheckFailed"
  namespace           = "AWS/EC2"
  period              = "300"
  statistic           = "Average"
  threshold           = "0"
  alarm_description   = "This metric monitors EC2 status checks"
  alarm_actions       = var.sns_topic_arn != "" ? [var.sns_topic_arn] : []

  dimensions {
    InstanceId = var.ec2_instance_ids[count.index]
  }

  tags = {
    Name        = "${var.project_name}-ec2-status-check-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_cloudwatch_metric_alarm" "alb_5xx_errors" {
  count               = var.alb_arn != "" ? 1 : 0
  alarm_name          = "${var.project_name}-alb-5xx-errors-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "HTTPCode_ELB_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = "300"
  statistic           = "Sum"
  threshold           = var.alb_5xx_threshold
  alarm_description   = "This metric monitors ALB 5XX errors"
  alarm_actions       = var.sns_topic_arn != "" ? [var.sns_topic_arn] : []

  dimensions {
    LoadBalancer = var.alb_arn
  }

  tags = {
    Name        = "${var.project_name}-alb-5xx-errors-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_cloudwatch_metric_alarm" "alb_target_response_time" {
  count               = var.alb_arn != "" ? 1 : 0
  alarm_name          = "${var.project_name}-alb-response-time-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "TargetResponseTime"
  namespace           = "AWS/ApplicationELB"
  period              = "300"
  statistic           = "Average"
  threshold           = var.alb_response_time_threshold
  alarm_description   = "This metric monitors ALB target response time"
  alarm_actions       = var.sns_topic_arn != "" ? [var.sns_topic_arn] : []

  dimensions {
    LoadBalancer = var.alb_arn
  }

  tags = {
    Name        = "${var.project_name}-alb-response-time-${var.environment}"
    Environment = var.environment
  }
}
