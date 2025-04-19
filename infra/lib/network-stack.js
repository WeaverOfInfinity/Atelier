import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class NetworkStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);
    
    // Create the VPC with public subnets only
    this.vpc = new ec2.Vpc(this, 'AtelierVPC', {
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
      maxAzs: 3,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'PublicSubnet',
          subnetType: ec2.SubnetType.PUBLIC,
        }, // create 3 public subnets
      ],
      natGateways: 0, // No private subnets or NAT gateways
    });

    // === SECURITY GROUPS ===
    this.frontendAlbSG = new ec2.SecurityGroup(this, 'FrontendAlbSG', {
      vpc: this.vpc,
      description: 'Allows public traffic to frontend ALB, and from frontend ALB to frontend ASG',
      allowAllOutbound: true,
    });

    this.frontendAsgSG = new ec2.SecurityGroup(this, 'FrontendAsgSG', {
      vpc: this.vpc,
      description: 'Allows traffic only from frontend ALB, and all outbound traffic',
      allowAllOutbound: true,
    });

    this.backendAlbSG = new ec2.SecurityGroup(this, 'BackendAlbSG', {
      vpc: this.vpc,
      description: 'Allows traffic only from frontend ASG, and from backend ALB to backend ASG',
      allowAllOutbound: true,
    });

    this.backendAsgSG = new ec2.SecurityGroup(this, 'BackendAsgSG', {
      vpc: this.vpc,
      description: 'Allows traffic only from backend ALB, and all outbound traffic',
      allowAllOutbound: true,
    });


    // === CONNECTION RULES ===

    // Public internet → Frontend ALB
    this.frontendAlbSG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow HTTP');
    this.frontendAlbSG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'Allow HTTPS');
    
    this.backendAlbSG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow HTTP');
    this.backendAlbSG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'Allow HTTPS');

    this.frontendAsgSG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow HTTP');
    this.backendAsgSG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow HTTP');

    // // Frontend ALB → Frontend ASG
    // this.frontendAlbSG.connections.allowTo(this.frontendAsgSG, ec2.Port.tcp(3000), 'ALB to ASG');
    // // Reverse rule for completeness, though not strictly required
    // this.frontendAsgSG.connections.allowFrom(this.frontendAlbSG, ec2.Port.tcp(3000), 'Allow from ALB');

    // // Frontend ASG → Backend ALB
    // this.backendAlbSG.connections.allowFrom(this.frontendAsgSG, ec2.Port.tcp(5000), 'Allow from Frontend ASG');

    // // Backend ALB → Backend ASG
    // this.backendAlbSG.connections.allowTo(this.backendAsgSG, ec2.Port.tcp(5000), 'Backend ALB to Backend ASG');
    // this.backendAsgSG.connections.allowFrom(this.backendAlbSG, ec2.Port.tcp(5000), 'Allow from Backend ALB');


    // Tag the VPC
    cdk.Tags.of(this.vpc).add('Name', 'AtelierVPC');
    cdk.Tags.of(this.vpc).add('Realm', 'Networking');
    cdk.Tags.of(this.frontendAlbSG).add('Name', 'AtelierFrontendALBSG');
    cdk.Tags.of(this.frontendAlbSG).add('Realm', 'Networking');
    
    // Export VPC and subnet IDs needed by other stacks
    new cdk.CfnOutput(this, 'VPCId', {
      value: this.vpc.vpcId,
      exportName: 'AtelierVPCId',
    });
    
    const publicSubnets = this.vpc.publicSubnets;
    new cdk.CfnOutput(this, 'PublicSubnetAId', {
      value: publicSubnets[0].subnetId,
      exportName: 'AtelierPublicSubnetAId',
    });
    
    new cdk.CfnOutput(this, 'PublicSubnetBId', {
      value: publicSubnets[1].subnetId,
      exportName: 'AtelierPublicSubnetBId',
    });
    
    new cdk.CfnOutput(this, 'PublicSubnetCId', {
      value: publicSubnets[2].subnetId,
      exportName: 'AtelierPublicSubnetCId',
    });

    // Export SG IDs for other stacks
    new cdk.CfnOutput(this, 'FrontendAlbSGId', {
      value: this.frontendAlbSG.securityGroupId,
      exportName: 'AtelierFrontendAlbSGId',
    });

    new cdk.CfnOutput(this, 'FrontendAsgSGId', {
      value: this.frontendAsgSG.securityGroupId,
      exportName: 'AtelierFrontendAsgSGId',
    });

    new cdk.CfnOutput(this, 'BackendAlbSGId', {
      value: this.backendAlbSG.securityGroupId,
      exportName: 'AtelierBackendAlbSGId',
    });

    new cdk.CfnOutput(this, 'BackendAsgSGId', {
      value: this.backendAsgSG.securityGroupId,
      exportName: 'AtelierBackendAsgSGId',
    });
  }
}