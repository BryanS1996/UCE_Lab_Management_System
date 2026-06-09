variable "environment" {
  type = string
}

variable "repository_names" {
  type = list(string)
}

variable "force_delete" {
  type    = bool
  default = true
}
