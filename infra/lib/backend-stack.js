// lib/backend-stack.js
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { AlbConstruct } from './shared_resources/alb-construct.js';
import { AsgConstruct } from './shared_resources/asg-construct.js';

export class BackendStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);
    
    const appRole = 'Backend';
    
    // Import VPC and subnets
    const vpc = ec2.Vpc.fromVpcAttributes(this, 'ImportedVpc', {
      vpcId: cdk.Fn.importValue('AtelierVPCId'),
      availabilityZones: cdk.Stack.of(this).availabilityZones,
      publicSubnetIds: [
        cdk.Fn.importValue('AtelierPublicSubnetAId'),
        cdk.Fn.importValue('AtelierPublicSubnetBId'),
        cdk.Fn.importValue('AtelierPublicSubnetCId'),
      ],
    });
    
    const subnets = [
      ec2.Subnet.fromSubnetId(this, 'PublicSubnetA', cdk.Fn.importValue('AtelierPublicSubnetAId')),
      ec2.Subnet.fromSubnetId(this, 'PublicSubnetB', cdk.Fn.importValue('AtelierPublicSubnetBId')),
      ec2.Subnet.fromSubnetId(this, 'PublicSubnetC', cdk.Fn.importValue('AtelierPublicSubnetCId')),
    ];
    
    // Import security groups
    const albSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(
      this,
      'BackendAlbSG',
      cdk.Fn.importValue('AtelierBackendAlbSGId')
    );
    
    const asgSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(
      this,
      'BackendAsgSG',
      cdk.Fn.importValue('AtelierBackendAsgSGId')
    );
    
    // Create ALB construct
    const alb = new AlbConstruct(this, 'BackendAlb', {
      vpc,
      subnets,
      securityGroup: albSecurityGroup,
      listenerPorts: [80],
      healthCheckPath: '/',
      healthCheckPort: 80,
      appRole,
    });
    

    const userDataScript = ec2.UserData.forLinux();
    userDataScript.addCommands(
        'sudo dnf update -y',
        'sudo dnf install -y git docker',
        'sudo systemctl start docker',
        'sudo systemctl enable docker',
        'sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
-o /usr/local/bin/docker-compose',
        'sudo chmod +x /usr/local/bin/docker-compose',
        'sudo mkdir -p /app',
        'cd /app',
        'sudo git clone https://github.com/WeaverOfInfinity/Atelier.git',
        'cd Atelier',
        'sudo git checkout release/v1',
        'cd api',
        'sudo docker-compose up -d'
    );

    // Create ASG construct
    new AsgConstruct(this, 'BackendAsg', {
      vpc,
      subnets,
      securityGroup: asgSecurityGroup,
      userData: userDataScript,
      appRole,
      targetGroup: alb.targetGroup,
    });
  }
}