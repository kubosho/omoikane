output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.main.id
}

output "cognito_user_pool_client_id" {
  value = aws_cognito_user_pool_client.client.id
}

output "cognito_identity_pool_id" {
  value = aws_cognito_identity_pool.main.id
}

output "s3_bucket_name" {
  value = aws_s3_bucket.main.id
}

output "aws_region" {
  value = var.aws_region
}


