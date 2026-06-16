# ─── ASG CPU Alarm ────────────────────────────────────────────────────────────
# Tracks average CPU utilization across ALL instances in the ASG.
# count = 0 when asg_name is empty (e.g., in environments without an ASG).
resource "aws_cloudwatch_metric_alarm" "asg_cpu_high" {
  count               = var.asg_name != "" ? 1 : 0
  alarm_name          = "${var.project_name}-asg-cpu-high-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Average"
  threshold           = var.cpu_threshold
  alarm_description   = "Average CPU across the ${var.asg_name} ASG exceeds ${var.cpu_threshold}%"
  alarm_actions       = var.sns_topic_arn != "" ? [var.sns_topic_arn] : []

  # FIX: 'dimensions' must be an argument assignment (= {}), not a block ({}).
  # AutoScalingGroupName aggregates the metric across every instance in the group.
  dimensions = {
    AutoScalingGroupName = var.asg_name
  }

  tags = {
    Name        = "${var.project_name}-asg-cpu-high-${var.environment}"
    Environment = var.environment
  }
}

# ─── ASG Status Check Alarm ───────────────────────────────────────────────────
# Fires when any instance in the ASG fails its EC2 status check.
resource "aws_cloudwatch_metric_alarm" "asg_status_check" {
  count               = var.asg_name != "" ? 1 : 0
  alarm_name          = "${var.project_name}-asg-status-check-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "StatusCheckFailed"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Maximum"
  threshold           = 0
  alarm_description   = "One or more instances in the ${var.asg_name} ASG failed their status check"
  alarm_actions       = var.sns_topic_arn != "" ? [var.sns_topic_arn] : []

  # FIX: argument syntax with equals sign.
  dimensions = {
    AutoScalingGroupName = var.asg_name
  }

  tags = {
    Name        = "${var.project_name}-asg-status-check-${var.environment}"
    Environment = var.environment
  }
}

# ─── ALB 5XX Errors Alarm ─────────────────────────────────────────────────────
resource "aws_cloudwatch_metric_alarm" "alb_5xx_errors" {
  count               = var.create_alb_alarms ? 1 : 0
  alarm_name          = "${var.project_name}-alb-5xx-errors-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "HTTPCode_ELB_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 300
  statistic           = "Sum"
  threshold           = var.alb_5xx_threshold
  alarm_description   = "ALB 5XX error count exceeded ${var.alb_5xx_threshold} in a 5-minute window"
  alarm_actions       = var.sns_topic_arn != "" ? [var.sns_topic_arn] : []

  # FIX: argument syntax with equals sign.
  dimensions = {
    LoadBalancer = var.alb_arn
  }

  tags = {
    Name        = "${var.project_name}-alb-5xx-errors-${var.environment}"
    Environment = var.environment
  }
}

# ─── ALB Target Response Time Alarm ──────────────────────────────────────────
resource "aws_cloudwatch_metric_alarm" "alb_target_response_time" {
  count               = var.create_alb_alarms ? 1 : 0
  alarm_name          = "${var.project_name}-alb-response-time-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "TargetResponseTime"
  namespace           = "AWS/ApplicationELB"
  period              = 300
  statistic           = "Average"
  threshold           = var.alb_response_time_threshold
  alarm_description   = "ALB average target response time exceeded ${var.alb_response_time_threshold}s"
  alarm_actions       = var.sns_topic_arn != "" ? [var.sns_topic_arn] : []

  # FIX: argument syntax with equals sign.
  dimensions = {
    LoadBalancer = var.alb_arn
  }

  tags = {
    Name        = "${var.project_name}-alb-response-time-${var.environment}"
    Environment = var.environment
  }
}
