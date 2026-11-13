terraform {
  required_version = ">= 1.10.0"
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = "ap-south-1"
}

resource "aws_s3_bucket" "lock-bucket" {
  bucket = "terraform-state-lock-bucket-test-18-11-03"
}

resource "aws_s3_bucket_versioning" "lock-bucket-versioning" {
  bucket = aws_s3_bucket.lock-bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "lock-bucket-public-access-block" {
  bucket = aws_s3_bucket.lock-bucket.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}


output "bucket_name" {
  value = aws_s3_bucket.lock-bucket.id
}

output "bucket_arn" {
  value = aws_s3_bucket.lock-bucket.arn
}
