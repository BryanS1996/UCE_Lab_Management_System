variable "instance_type" { default = "t3.micro" }
variable "environment" { type = string }
variable "key_pair_name" {
  type    = string
  default = ""
}
variable "project_name" {
  type    = string
  default = "uce-lab-mgmt"
}
