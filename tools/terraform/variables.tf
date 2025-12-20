variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "omoikane"
}

variable "s3_bucket_name" {
  description = "Name of the S3 bucket"
  type        = string
}

variable "aws_region" {
  description = "AWS Region"
  type        = string
  default     = "ap-northeast-1"
}

variable "google_client_id" {
  description = "Google Client ID for Identity Provider"
  type        = string
  sensitive   = true
}

variable "google_client_secret" {
  description = "Google Client Secret for Identity Provider"
  type        = string
  sensitive   = true
}

variable "port" {
  description = "Development server port"
  type        = number
  default     = 45537
}

variable "production_domain" {
  description = "Production domain for Cognito callback URLs"
  type        = string
  default     = "omoikane.kubosho.com"
}
