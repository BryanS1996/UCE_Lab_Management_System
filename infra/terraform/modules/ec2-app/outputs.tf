output "instance_id" {
  value = aws_instance.app.id
}

output "public_ip" {
  value = var.allocate_eip ? aws_eip.app[0].public_ip : aws_instance.app.public_ip
}

output "security_group_id" {
  value = aws_security_group.app.id
}
