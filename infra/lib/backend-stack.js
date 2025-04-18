import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { BaseAlbStack } from './shared_resources/alb-stack';
import { BaseAsgStack } from './shared_resources/asg-stack';

export class BackendStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);

        const backendAlb = new BaseAlbStack(this, 'BackendAlb', {
            appRole: 'Backend',
            vpc: props.networkStack.vpc,
            publicSubnets: props.networkStack.vpc.publicSubnets,
            securityGroup: props.networkStack.backendAlbSG,
            listenerPorts: [80],
            healthCheckPath: '/',
            healthCheckPort: 80,
        });

        const userData = `
            #!/bin/bash
            set -e

            # Log all output to a file
            exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

            # Update system packages
            dnf update -y

            # Install Git, Docker, and AWS CLI
            dnf install -y git docker

            # Start and enable Docker service
            systemctl start docker
            systemctl enable docker

            # Install docker-compose
            curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
            -o /usr/local/bin/docker-compose
            chmod +x /usr/local/bin/docker-compose

            # Create application directory
            mkdir -p /app
            cd /app

            # Clone application repository (replace with your actual repository URL)
            git clone https://github.com/WeaverOfInfinity/Atelier.git
            cd Atelier/api

            # Build and start application with Docker
            docker-compose up -d

            # Log success message
            echo "User data script completed successfully" >> /var/log/user-data.log
        `;

        const backendAsg = new BaseAsgStack(this, 'BackendAsg', {
            appRole: 'Backend',
            vpc: props.networkStack.vpc,
            subnets: props.networkStack.vpc.publicSubnets,
            securityGroup: props.networkStack.backendAsgSG,
            targetGroup: backendAlb.targetGroup,
            userData: userData,
        });
    }
}