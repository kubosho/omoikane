# S3 bucket for storing image files
# Accessed via API routes (server-side), so public access is blocked
resource "aws_s3_bucket" "main" {
  bucket = var.s3_bucket_name

  lifecycle {
    prevent_destroy = true
  }
}

# IdP configuration to enable login using Google accounts
# This allows users to sign up/sign in seamlessly with their existing Google accounts
resource "aws_cognito_identity_provider" "google" {
  user_pool_id  = aws_cognito_user_pool.main.id
  provider_name = "Google"
  provider_type = "Google"

  provider_details = {
    authorize_scopes = "email openid"
    client_id        = var.google_client_id
    client_secret    = var.google_client_secret
  }

  attribute_mapping = {
    email = "email"
  }
}

# Pool for managing user authentication
# Since only Google authentication is used, password policies and email verification are disabled
# to rely heavily on the external IdP (Google)
resource "aws_cognito_user_pool" "main" {
  name = "${var.project_name}-user-pool"
}

# Hosted UI domain required for OAuth authentication flow
# Auth.js uses this domain for redirects during the authentication process
resource "aws_cognito_user_pool_domain" "main" {
  domain       = var.project_name
  user_pool_id = aws_cognito_user_pool.main.id
}

# Client configuration for the application to use Cognito
# Defines the authentication flow (Authorization Code Grant) and callback URLs
# to establish a trust relationship between the application and Cognito
resource "aws_cognito_user_pool_client" "client" {
  name            = "${var.project_name}-client"
  user_pool_id    = aws_cognito_user_pool.main.id
  generate_secret = true

  supported_identity_providers = ["COGNITO", "Google"]

  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["email", "openid"]

  callback_urls = [
    "http://localhost:${var.port}/api/auth/callback/cognito",
    "https://${var.production_domain}/api/auth/callback/cognito"
  ]
  logout_urls = [
    "http://localhost:${var.port}",
    "https://${var.production_domain}"
  ]

  depends_on = [aws_cognito_identity_provider.google]
}

# Pool for managing authenticated user identities
# Used to link Cognito users with AWS IAM roles (though S3 access is handled server-side)
resource "aws_cognito_identity_pool" "main" {
  identity_pool_name               = "${var.project_name}-identity-pool"
  allow_unauthenticated_identities = false

  cognito_identity_providers {
    client_id               = aws_cognito_user_pool_client.client.id
    provider_name           = aws_cognito_user_pool.main.endpoint
    server_side_token_check = true
  }
}


# Configuration linking the Identity Pool and IAM Role
# Assigns the `authenticated` role defined above to "authenticated users"
resource "aws_cognito_identity_pool_roles_attachment" "main" {
  identity_pool_id = aws_cognito_identity_pool.main.id

  roles = {
    authenticated = aws_iam_role.authenticated.arn
  }
}

# IAM role assumed by authenticated users
# Trust policy is configured so that only users authenticated by the Cognito Identity Pool can assume this role
resource "aws_iam_role" "authenticated" {
  name = "${var.project_name}-authenticated-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = "cognito-identity.amazonaws.com"
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "cognito-identity.amazonaws.com:aud" = aws_cognito_identity_pool.main.id
          }
          "ForAnyValue:StringLike" = {
            "cognito-identity.amazonaws.com:amr" = "authenticated"
          }
        }
      }
    ]
  })
}

# S3 access policy for authenticated users
# Grants CRUD permissions on the image bucket for users authenticated via Cognito Identity Pool
resource "aws_iam_role_policy" "authenticated_s3_access" {
  name = "${var.project_name}-authenticated-s3-access"
  role = aws_iam_role.authenticated.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.main.arn,
          "${aws_s3_bucket.main.arn}/*"
        ]
      }
    ]
  })
}
