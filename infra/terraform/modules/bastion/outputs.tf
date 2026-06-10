output "instance_id" {
  value = aws_instance.bastion.id
}

output "public_ip" {
  value = aws_instance.bastion.public_ip
}

output "private_ip" {
  value = aws_instance.bastion.private_ip
}

output "security_group_id" {
  value = aws_security_group.bastion.id
}
