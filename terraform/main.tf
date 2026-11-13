terraform {
  required_version = ">= 1.10.0"
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "~> 6.0"
    }
  }


  backend "s3" {
    bucket = "terraform-state-lock-bucket-test-18-11-03"
    key    = "terraform.tfstate"
    region = "ap-south-1"
    use_lockfile = true
  }
}

resource "aws_vpc" "terra_vpc" {
  cidr_block = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
}


resource "aws_subnet" "terra_subnet_public_1" {
  vpc_id                  = aws_vpc.terra_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "ap-south-1a"
  map_public_ip_on_launch = true
}

resource "aws_subnet" "terra_subnet_public_2" {
  vpc_id                  = aws_vpc.terra_vpc.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "ap-south-1b"
  map_public_ip_on_launch = true
}


resource "aws_subnet" "terra_subnet_private_1" {
  vpc_id            = aws_vpc.terra_vpc.id
  cidr_block        = "10.0.3.0/24"
  availability_zone = "ap-south-1a"
}

resource "aws_subnet" "terra_subnet_private_2" {
  vpc_id            = aws_vpc.terra_vpc.id
  cidr_block        = "10.0.4.0/24"
  availability_zone = "ap-south-1b"
}


resource "aws_internet_gateway" "terra-internet-gateway" {
  vpc_id = aws_vpc.terra_vpc.id
}

resource "aws_route_table" "terra-route-table-public" {
  vpc_id = aws_vpc.terra_vpc.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.terra-internet-gateway.id
  }
}

resource "aws_route_table_association" "terra-route-table-association-public-1" {
  subnet_id = aws_subnet.terra_subnet_public_1.id
  route_table_id = aws_route_table.terra-route-table-public.id
}

resource "aws_route_table_association" "terra-route-table-association-public-2" {
  subnet_id = aws_subnet.terra_subnet_public_2.id
  route_table_id = aws_route_table.terra-route-table-public.id
}

resource "aws_security_group" "terra-security-group" {
  name        = "terra-security-group"
  description = "Security group for Terraform"
  vpc_id      = aws_vpc.terra_vpc.id

  ingress {
    description = "Allow SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Allow HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Allow HTTPS"
    from_port   = 443
    to_port     = 443
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


resource "aws_iam_role" "terra_iam_role" {
  name = "terra-iam-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "eks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "terra_iam_role_policy_attachment" {
  role       = aws_iam_role.terra_iam_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
}

resource "aws_eks_cluster" "terra_eks_cluster" {
  name = "terra-eks-cluster"
  role_arn = aws_iam_role.terra_iam_role.arn
  vpc_config {
    subnet_ids = [aws_subnet.terra_subnet_public_1.id, aws_subnet.terra_subnet_public_2.id]
  
  }

  depends_on = [aws_iam_role_policy_attachment.terra_iam_role_policy_attachment]
}



# IAM role for EC2 worker nodes
resource "aws_iam_role" "terra_node_role" {
  name = "terra-eks-node-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"

        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

# Allow worker nodes to communicate with EKS
resource "aws_iam_role_policy_attachment" "terra_worker_policy" {
  role       = aws_iam_role.terra_node_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
}

# Allow VPC networking for Kubernetes pods
resource "aws_iam_role_policy_attachment" "terra_cni_policy" {
  role       = aws_iam_role.terra_node_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
}

# Allow nodes to pull container images from ECR
resource "aws_iam_role_policy_attachment" "terra_ecr_policy" {
  role       = aws_iam_role.terra_node_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPullOnly"
}

 
resource "aws_eks_node_group" "terra_node_group" {
  cluster_name    = aws_eks_cluster.terra_eks_cluster.name
  node_group_name = "terra-worker-nodes"
  node_role_arn   = aws_iam_role.terra_node_role.arn

  subnet_ids = [
    aws_subnet.terra_subnet_public_1.id,
    aws_subnet.terra_subnet_public_2.id
  ]

  instance_types = ["t3.small"]
  capacity_type  = "ON_DEMAND"

  scaling_config {
    desired_size = 1
    min_size     = 1
    max_size     = 1
  }

  depends_on = [
    aws_iam_role_policy_attachment.terra_worker_policy,
    aws_iam_role_policy_attachment.terra_cni_policy,
    aws_iam_role_policy_attachment.terra_ecr_policy
  ]
}


