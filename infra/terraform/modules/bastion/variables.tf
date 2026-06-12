variable "environment" {
  type = string
}

variable "project_name" {
  type    = string
  default = "uce-lab"
}

variable "vpc_id" {
  type = string
}

variable "subnet_id" {
  type = string
}

variable "instance_type" {
  type    = string
  default = "t3.micro"
}

variable "key_pair_name" {
  type        = string
  description = "Key pair name for SSH access"
}

variable "ssh_cidr_blocks" {
  type        = list(string)
  description = "CIDR blocks allowed to SSH to bastion"
  default     = ["0.0.0.0/0"]
}

variable "root_volume_size" {
  type    = number
  default = 8
}
