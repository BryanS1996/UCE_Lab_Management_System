# 1. Buscar el sistema operativo mas reciente (Amazon Linux 2023)
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023*-x86_64"]
  }
}

# 2. Crear la Maquina EC2 (El Bastion Host)
resource "aws_instance" "bastion" {
  ami           = data.aws_ami.amazon_linux.id
  instance_type = "t2.micro"

  # Lo colocamos en la subred publica que creamos antes
  subnet_id = aws_subnet.public_1.id

  # Le asignamos su guardia de seguridad
  vpc_security_group_ids = [aws_security_group.bastion_sg.id]

  # ESTO ES CLAVE EN AWS ACADEMY: Usa el rol por defecto del laboratorio
  iam_instance_profile = "LabInstanceProfile"

  tags = {
    Name = "uce-lab-bastion-qa"
  }
}