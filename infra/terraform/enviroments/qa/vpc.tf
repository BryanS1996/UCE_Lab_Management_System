# 1. Crear la Red Principal (VPC)
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "uce-lab-vpc-qa"
  }
}

# 2. Puerta de enlace a Internet (Para que el VPC tenga conexión afuera)
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "uce-lab-igw-qa"
  }
}

# 3. Subred Pública (Donde vivirá tu Bastion Host)
resource "aws_subnet" "public_1" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = true # Esto le da IP pública al Bastion automáticamente

  tags = {
    Name = "uce-lab-public-subnet-1-qa"
  }
}

# 4. Subred Privada (Donde vivirá tu Base de Datos y Microservicios)
resource "aws_subnet" "private_1" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.10.0/24"
  availability_zone = "us-east-1a"

  tags = {
    Name = "uce-lab-private-subnet-1-qa"
  }
}

# 5. Tabla de Rutas Pública (Para que la subred pública se conecte al Internet Gateway)
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "uce-lab-public-rt-qa"
  }
}

# 6. Asociar la Tabla de Rutas a la Subred Pública
resource "aws_route_table_association" "public_1_assoc" {
  subnet_id      = aws_subnet.public_1.id
  route_table_id = aws_route_table.public_rt.id
}