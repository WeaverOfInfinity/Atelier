import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class NetworkStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);
    
    // Use the default VPC instead of creating a new one
    this.vpc = ec2.Vpc.fromLookup(this, 'DefaultVPC', {
      isDefault: true
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

    // Allow all inbound traffic for each security group
    this.frontendAlbSG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.allTraffic(), 'Allow all traffic');
    this.frontendAsgSG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.allTraffic(), 'Allow all traffic');
    this.backendAlbSG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.allTraffic(), 'Allow all traffic');
    this.backendAsgSG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.allTraffic(), 'Allow all traffic');

    // Tag the VPC
    cdk.Tags.of(this.vpc).add('Name', 'DefaultVPC');
    cdk.Tags.of(this.vpc).add('Realm', 'Networking');
    cdk.Tags.of(this.frontendAlbSG).add('Name', 'AtelierFrontendALBSG');
    cdk.Tags.of(this.frontendAlbSG).add('Realm', 'Networking');
    
    // Export VPC ID needed by other stacks
    new cdk.CfnOutput(this, 'VPCId', {
      value: this.vpc.vpcId,
      exportName: 'AtelierVPCId',
    });
    
    // Export all public subnet IDs from the default VPC
    // Note: We're exporting the first 3 public subnets from the default VPC
    const publicSubnets = this.vpc.publicSubnets;
    
    for (let i = 0; i < Math.min(3, publicSubnets.length); i++) {
      new cdk.CfnOutput(this, `PublicSubnet${String.fromCharCode(65 + i)}Id`, {
        value: publicSubnets[i].subnetId,
        exportName: `AtelierPublicSubnet${String.fromCharCode(65 + i)}Id`,
      });
    }

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