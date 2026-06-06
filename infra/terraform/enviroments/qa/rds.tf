# 1. Crear una segunda subred privada (Requisito obligatorio de AWS RDS)
resource "aws_subnet" "private_2" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.11.0/24"
  availability_zone = "us-east-1b" # Zona B

  tags = {
    Name = "uce-lab-private-subnet-2-qa"
  }
}

# 2. Agrupar las subredes (DB Subnet Group)
resource "aws_db_subnet_group" "db_subnet_group" {
  name       = "uce-lab-db-subnet-group-qa"
  subnet_ids = [aws_subnet.private_1.id, aws_subnet.private_2.id]

  tags = {
    Name = "uce-lab-db-subnet-group-qa"
  }
}

# 3. Crear la Instancia RDS PostgreSQL
resource "aws_db_instance" "postgres" {
  identifier        = "uce-lab-db-qa"
  engine            = "postgres"
  engine_version    = "15"
  instance_class    = "db.t3.micro" # Capa gratuita / bajo costo
  allocated_storage = 20            # 20 GB de almacenamiento SSD

  # Credenciales del superusuario (En prod usaremos Secrets Manager, por ahora lo pasamos directo)
  username = "postgres"
  password = "admin12345" # Debe tener al menos 8 caracteres

  db_subnet_group_name   = aws_db_subnet_group.db_subnet_group.name
  vpc_security_group_ids = [aws_security_group.db_sg.id]

  # Configuraciones críticas para cuentas de laboratorio y QA
  publicly_accessible = false
  skip_final_snapshot = true # AWS Academy falla si esto está en false al destruir
  apply_immediately   = true

  tags = {
    Name = "uce-lab-rds-qa"
  }
}

# 4. Mostrar el Endpoint (URL) de la base de datos al finalizar
output "rds_endpoint" {
  description = "URL de conexión de la base de datos"
  value       = aws_db_instance.postgres.endpoint
}