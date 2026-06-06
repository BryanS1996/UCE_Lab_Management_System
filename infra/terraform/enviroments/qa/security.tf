# ─────────────────────────────────────────────────────
# FIREWALL 1: BASTION HOST
# ─────────────────────────────────────────────────────
resource "aws_security_group" "bastion_sg" {
  name        = "uce-lab-bastion-sg-qa"
  description = "Security Group para el Bastion Host (Acceso seguro via SSM)"
  vpc_id      = aws_vpc.main.id

  # No hay bloque 'ingress' (entrada) intencionalmente.
  # AWS SSM no necesita puertos de entrada abiertos, lo que lo hace 100% inmune a hackeos.

  # Permitimos que la maquina salga a internet para descargar actualizaciones
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "uce-lab-bastion-sg-qa"
  }
}

# ─────────────────────────────────────────────────────
# FIREWALL 2: BASE DE DATOS (RDS)
# ─────────────────────────────────────────────────────
resource "aws_security_group" "db_sg" {
  name        = "uce-lab-db-sg-qa"
  description = "Security Group para la Base de Datos PostgreSQL"
  vpc_id      = aws_vpc.main.id

  # Solo permitimos trafico al puerto 5432 (Postgres) SI viene desde el Bastion
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "uce-lab-db-sg-qa"
  }
}