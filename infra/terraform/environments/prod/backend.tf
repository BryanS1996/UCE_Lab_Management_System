terraform {
  backend "s3" {
    bucket         = "uce-lab-tfstate-385774255870-prod"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    use_lockfile = true
    encrypt        = true
  }
}