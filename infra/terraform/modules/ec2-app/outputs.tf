# NOTE: instance_id and private_ip are no longer static outputs —
# the ASG manages a fleet of instances. Use the ASG name to query
# running instances dynamically (e.g., via aws ec2 describe-instances).

output "asg_name" {
  description = "Name of the Auto Scaling Group"
  value       = aws_autoscaling_group.app.name
}

output "security_group_id" {
  description = "Security Group ID for the app instances (used by RDS ingress rules)"
  value       = aws_security_group.app.id
}

output "launch_template_id" {
  description = "ID of the Launch Template"
  value       = aws_launch_template.app.id
}
