# ─── Security Group ────────────────────────────────────────────────────────────
resource "aws_security_group" "db" {
  name        = "${var.project_name}-db-sg-${var.environment}"
  description = "PostgreSQL RDS - ${var.environment}"
  vpc_id      = var.vpc_id

  ingress {
    description     = "PostgreSQL desde app server"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [var.app_security_group_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-db-sg-${var.environment}"
  }
}

resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-${var.environment}"
  subnet_ids = var.subnet_ids

  tags = {
    Name = "${var.project_name}-db-subnet-${var.environment}"
  }
}

# ─── Snapshot Restore Logic ────────────────────────────────────────────────────
# COMENTADO TEMPORALMENTE PARA EL PRIMER DESPLIEGUE (No hay snapshots todavía)
# data "aws_db_snapshot" "latest" {
#   db_instance_identifier = "${var.project_name}-db-${var.environment}"
#   most_recent            = true
#   snapshot_type          = "manual"
# }

# ─── RDS Instance ──────────────────────────────────────────────────────────────
resource "aws_db_instance" "postgres" {
  identifier        = "${var.project_name}-db-${var.environment}"
  engine            = "postgres"
  engine_version    = var.engine_version
  instance_class    = var.instance_class
  allocated_storage = var.allocated_storage

  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.db.id]

  publicly_accessible = false
  apply_immediately   = true
  storage_encrypted   = false

  skip_final_snapshot       = false
  final_snapshot_identifier = "${var.project_name}-db-${var.environment}-final-${formatdate("YYYYMMDDhhmmss", timestamp())}"

  # COMENTADO TEMPORALMENTE PARA EL PRIMER DESPLIEGUE
  # snapshot_identifier = try(data.aws_db_snapshot.latest.id, null)

  tags = {
    Name = "${var.project_name}-rds-${var.environment}"
  }

  lifecycle {
    # Evitamos ignorar "snapshot_identifier" mientras esté comentado
    ignore_changes = [final_snapshot_identifier]
  }
}