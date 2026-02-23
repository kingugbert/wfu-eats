# ─────────────────────────────────────────────
# Outputs
# ─────────────────────────────────────────────

output "app_url" {
  description = "Application URL (ALB DNS)"
  value       = "http://${aws_lb.main.dns_name}"
}

output "api_url" {
  description = "API URL"
  value       = "http://${aws_lb.main.dns_name}/api"
}

output "ecr_backend_url" {
  description = "ECR Backend repository URL"
  value       = aws_ecr_repository.backend.repository_url
}

output "ecr_frontend_url" {
  description = "ECR Frontend repository URL"
  value       = aws_ecr_repository.frontend.repository_url
}

output "rds_endpoint" {
  description = "RDS endpoint"
  value       = aws_db_instance.main.endpoint
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}
