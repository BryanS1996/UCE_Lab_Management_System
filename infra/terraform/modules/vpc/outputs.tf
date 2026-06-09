output "vpc_id" {
  value = aws_vpc.main.id
}

output "public_subnet_id" {
  value = aws_subnet.public.id
}

output "private_subnet_ids" {
  value = var.enable_private_subnets ? [aws_subnet.private_1[0].id, aws_subnet.private_2[0].id] : []
}
