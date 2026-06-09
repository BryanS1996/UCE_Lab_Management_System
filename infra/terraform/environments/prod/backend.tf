terraform {
  backend "s3" {
    bucket         = "uce-lab-tfstate-667958273162-prod"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "uce-lab-tflock-prod"                
    encrypt        = true
  }
}