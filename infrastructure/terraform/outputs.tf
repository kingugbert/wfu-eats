output "app_url" {
  value       = "http://${aws_lb.main.dns_name}"
  description = "Application URL"
}

output "api_url" {
  value       = "http://${aws_lb.main.dns_name}/api"
  description = "API URL"
}

output "backend_ecr_url" {
  value       = aws_ecr_repository.backend.repository_url
  description = "Backend ECR repository URL"
}

output "frontend_ecr_url" {
  value       = aws_ecr_repository.frontend.repository_url
  description = "Frontend ECR repository URL"
}

output "rds_endpoint" {
  value       = aws_db_instance.main.endpoint
  description = "RDS endpoint"
}

output "cluster_name" {
  value       = aws_ecs_cluster.main.name
  description = "ECS cluster name"
}

output "vpc_id" {
  value       = aws_vpc.main.id
  description = "VPC ID"
}

output "public_subnets" {
  value       = aws_subnet.public[*].id
  description = "Public subnet IDs"
}

output "ecs_security_group" {
  value       = aws_security_group.ecs.id
  description = "ECS security group ID"
}
