import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class NetworkStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);
    
    // Create the VPC with public subnets only
    this.vpc = new ec2.Vpc(this, 'AtelierVPC', {
      cidr: '10.0.0.0/16',
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
    
    // Tag the VPC
    cdk.Tags.of(this.vpc).add('Name', 'AtelierVPC');
    
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
  }
}