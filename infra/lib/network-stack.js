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
        },
      ],
      natGateways: 0, // No private subnets or NAT gateways
    });

    // === FRONTEND ALB SECURITY GROUP ===
    this.frontendAlbSG = new ec2.SecurityGroup(this, 'FrontendALBSG', {
      vpc,
      description: 'Allows public traffic on HTTP and HTTPS for frontend ALB',
      allowAllOutbound: true, // Allow all outbound traffic (default is true)
    });

    this.frontendAlbSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allow HTTP traffic from anywhere'
    );

    this.frontendAlbSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'Allow HTTPS traffic from anywhere'
    );
    
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
    new cdk.CfnOutput(this, 'FrontendALBSGId', {
      value: this.frontendAlbSG.securityGroupId,
      exportName: 'FrontendALBSGId',
    });
  }
}