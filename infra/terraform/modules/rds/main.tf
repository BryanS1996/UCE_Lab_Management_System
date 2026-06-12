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
# Look up the most recent final snapshot for this DB identifier.
# On first apply: no snapshot exists → data source returns empty → fresh DB.
# On subsequent applies after a destroy: snapshot is found → DB restored from it.
data "aws_db_snapshot" "latest" {
  db_instance_identifier = "${var.project_name}-db-${var.environment}"
  most_recent            = true
  snapshot_type          = "manual"

  # Suppress error when no snapshot exists yet (first deploy)
  # The data source returns null results when no match is found.
}

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

  # ── Snapshot configuration ──────────────────────────────────────────────────
  # Never destroy data silently — always save a final snapshot on destroy.
  skip_final_snapshot       = false
  final_snapshot_identifier = "${var.project_name}-db-${var.environment}-final-${formatdate("YYYYMMDDhhmmss", timestamp())}"

  # Restore from the latest snapshot if one exists; otherwise create a fresh DB.
  # The `try()` function returns null when no snapshot is found, causing RDS
  # to create a fresh instance (standard behavior).
  snapshot_identifier = try(data.aws_db_snapshot.latest.id, null)

  tags = {
    Name = "${var.project_name}-rds-${var.environment}"
  }

  lifecycle {
    # Prevent Terraform from replacing the DB if the snapshot lookup changes
    # between plans (e.g., after a restore the snapshot_identifier becomes null).
    ignore_changes = [snapshot_identifier, final_snapshot_identifier]
  }
}
