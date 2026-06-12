terraform {
  backend "s3" {
    bucket         = "uce-lab-tfstate-667958273162-prod"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    use_lockfile = true
    encrypt        = true
  }
}