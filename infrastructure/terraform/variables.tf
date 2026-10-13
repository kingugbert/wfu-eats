variable "aws_region" {
  description = "AWS region"
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name"
  default     = "wfu-eats"
}

variable "db_username" {
  description = "Database username"
  default     = "wfueats"
}

variable "db_password" {
  description = "Database password"
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT secret key"
  sensitive   = true
}

variable "google_places_api_key" {
  description = "Google Places API key"
  sensitive   = true
}
