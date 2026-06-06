variable "aws_region" { default = "us-east-1" }
variable "environment" { default = "prod" }
variable "project_name" { default = "uce-lab-mgmt" }
variable "ec2_instance_type" { default = "t3.micro" }
variable "key_pair_name" { type = string }
variable "db_password" {
  type      = string
  sensitive = true
}
variable "jwt_secret" {
  type      = string
  sensitive = true
}
variable "db_instance_class" { default = "db.t3.micro" }
