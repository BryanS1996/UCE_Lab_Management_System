terraform {
  backend "s3" {
    bucket         = "uce-lab-tfstate-906307926859-qa"
    key            = "qa/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "uce-lab-tflock-qa"
    encrypt        = true
  }
}