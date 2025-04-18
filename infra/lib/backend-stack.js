import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { BaseAlbStack } from './shared_resources/alb-stack.js';
import { BaseAsgStack } from './shared_resources/asg-stack.js';

export class BackendStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);

        const backendAlbSG = ec2.SecurityGroup.fromSecurityGroupId(
            this,
            'ImportedBackendAlbSG',
            cdk.Fn.importValue('AtelierBackendAlbSGId') // Use the export name from NetworkStack
        );

        const backendAsgSG = ec2.SecurityGroup.fromSecurityGroupId(
            this,
            'ImportedBackendAsgSG',
            cdk.Fn.importValue('AtelierBackendAsgSGId') // Use the export name from NetworkStack
        );

        const publicSubnets = [
            ec2.Subnet.fromSubnetId(this, 'PublicSubnetA', cdk.Fn.importValue('AtelierPublicSubnetAId')),
            ec2.Subnet.fromSubnetId(this, 'PublicSubnetB', cdk.Fn.importValue('AtelierPublicSubnetBId')),
            ec2.Subnet.fromSubnetId(this, 'PublicSubnetC', cdk.Fn.importValue('AtelierPublicSubnetCId')),
          ];

        const vpc = ec2.Vpc.fromVpcAttributes(this, 'ImportedVpc', {
            vpcId: cdk.Fn.importValue('AtelierVpcId'), // Use the export name from NetworkStack
            availabilityZones: cdk.Stack.of(this).availabilityZones,
            publicSubnetIds: [
                cdk.Fn.importValue('AtelierPublicSubnetAId'),
                cdk.Fn.importValue('AtelierPublicSubnetBId'),
                cdk.Fn.importValue('AtelierPublicSubnetCId'),
            ],
        });

        const backendAlb = new BaseAlbStack(this, 'BackendAlb', {
            appRole: 'Backend',
            vpc: vpc,
            publicSubnets: publicSubnets,
            securityGroup: backendAlbSG,
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
            cd Atelier
            git checkout release/v1
            cd api

            # Build and start application with Docker
            docker-compose up -d

            # Log success message
            echo "User data script completed successfully" >> /var/log/user-data.log
        `;

        const backendAsg = new BaseAsgStack(this, 'BackendAsg', {
            appRole: 'Backend',
            vpc: vpc,
            subnets: publicSubnets,
            securityGroup: backendAsgSG,
            targetGroup: backendAlb.targetGroup,
            userData: userData,
        });
    }
}