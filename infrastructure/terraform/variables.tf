# ─────────────────────────────────────────────
# Variables
# ─────────────────────────────────────────────

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment (staging or production)"
  type        = string
  default     = "staging"
}

# ── Database ─────────────────────────────────
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t4g.micro"  # Free tier eligible
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "wfu_admin"
  sensitive   = true
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
}

# ── Auth ─────────────────────────────────────
variable "jwt_secret" {
  description = "JWT signing secret"
  type        = string
  sensitive   = true
}

# ── ECS Backend ──────────────────────────────
variable "backend_cpu" {
  description = "Backend task CPU units (1024 = 1 vCPU)"
  type        = string
  default     = "256"
}

variable "backend_memory" {
  description = "Backend task memory (MB)"
  type        = string
  default     = "512"
}

variable "backend_desired_count" {
  description = "Number of backend tasks"
  type        = number
  default     = 1
}

# ── ECS Frontend ─────────────────────────────
variable "frontend_cpu" {
  description = "Frontend task CPU units"
  type        = string
  default     = "256"
}

variable "frontend_memory" {
  description = "Frontend task memory (MB)"
  type        = string
  default     = "512"
}

variable "frontend_desired_count" {
  description = "Number of frontend tasks"
  type        = number
  default     = 1
}
