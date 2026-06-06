resource "aws_security_group" "app_sg" {
  name        = "uce-lab-app-sg-qa"
  description = "Allow traffic to microservices"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 3000
    to_port     = 3050
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "app_server" {
  ami           = data.aws_ami.amazon_linux.id
  instance_type = "t3.medium"
  subnet_id     = aws_subnet.public_1.id
  vpc_security_group_ids = [aws_security_group.app_sg.id]
  iam_instance_profile   = "LabInstanceProfile"

  user_data = <<-EOF
              #!/bin/bash
              yum update -y
              yum install -y docker git
              systemctl start docker
              systemctl enable docker
              
              # Install Docker Compose
              curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
              chmod +x /usr/local/bin/docker-compose
              
              # Login to Docker Hub
              docker login -u "${var.docker_username}" -p "${var.docker_password}"
              
              # Setup application
              cd /home/ec2-user
              git clone https://github.com/[TU_USUARIO]/UCE_Lab_Management_System.git
              cd UCE_Lab_Management_System
              docker-compose -f docker-compose.qa.yml up -d
              EOF

  tags = { Name = "uce-lab-app-server-qa" }
}

variable "docker_username" { type = string }
variable "docker_password" { type = string }