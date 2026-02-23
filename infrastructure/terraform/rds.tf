# ─────────────────────────────────────────────
# RDS PostgreSQL
# ─────────────────────────────────────────────

resource "aws_db_subnet_group" "main" {
  name       = "wfu-eats-db-subnet"
  subnet_ids = aws_subnet.private[*].id
  tags       = { Name = "wfu-eats-db-subnet-group" }
}

resource "aws_db_instance" "main" {
  identifier = "wfu-eats-db"

  engine         = "postgres"
  engine_version = "16.4"
  instance_class = var.db_instance_class

  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = "wfu_eats"
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  multi_az            = var.environment == "production" ? true : false
  publicly_accessible = false

  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "Mon:04:00-Mon:05:00"

  skip_final_snapshot       = var.environment != "production"
  final_snapshot_identifier = var.environment == "production" ? "wfu-eats-final-snapshot" : null
  deletion_protection       = var.environment == "production"

  performance_insights_enabled = true

  tags = { Name = "wfu-eats-postgres" }
}
