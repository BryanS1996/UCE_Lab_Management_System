variable "instance_class" { default = "db.t3.micro" }
variable "db_name" { type = string }
variable "db_username" { type = string }
variable "db_password" {
  type      = string
  sensitive = true
}
variable "environment" { type = string }
