output "vpc_id" {
  value = aws_vpc.main.id
}

# Kept for backwards compatibility (bastion uses this single reference)
output "public_subnet_id" {
  value = aws_subnet.public.id
}

# Both public subnets — used by the ALB and the ASG for multi-AZ placement
output "public_subnet_ids" {
  value = [aws_subnet.public.id, aws_subnet.public_2.id]
}

output "private_subnet_ids" {
  value = [aws_subnet.private_1.id, aws_subnet.private_2.id]
}
