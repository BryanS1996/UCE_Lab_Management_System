terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region  = "us-east-1"
  profile = "qa" # <-- ¡ESTO ES LO MÁS IMPORTANTE!

  # AWS Academy a veces restringe ciertas etiquetas por defecto, 
  # pero probemos con estas, suelen ser permitidas:
  default_tags {
    tags = {
      Environment = "QA"
      Project     = "UCE_Lab_Management"
      ManagedBy   = "Terraform"
    }
  }
}