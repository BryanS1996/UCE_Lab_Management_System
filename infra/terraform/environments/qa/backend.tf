terraform {
  backend "s3" {
    bucket       = "uce-lab-tfstate-591895804514-qa"
    key          = "qa/terraform.tfstate"
    region       = "us-east-1"
    use_lockfile = true
    encrypt      = true
  }
}