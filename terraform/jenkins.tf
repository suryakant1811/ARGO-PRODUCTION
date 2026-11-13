resource "aws_instance" "jenkins_server" {
    ami = "ami-04b0b8ee9ce90920a"
    instance_type = "c7i-flex.large"
    subnet_id = aws_subnet.terra_subnet_public_1.id
    associate_public_ip_address = true
}