import { Stack, CfnOutput } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import { Duration } from 'aws-cdk-lib';

export class BaseAsgStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const {
      appRole,
      vpc,
      subnets,
      securityGroup,
      targetGroup,
      userData,
    } = props;

    // Create launch template
    const launchTemplate = new ec2.LaunchTemplate(this, `${appRole}-launch-template`, {
      machineImage: ec2.MachineImage.genericLinux({
        'af-south-1': "ami-0df82cf3ebb3eab9d",
      }),
      instanceType: new ec2.InstanceType("t3.micro"),
      securityGroup: securityGroup,
      userData: userData ? ec2.UserData.custom(userData) : undefined,
      blockDevices: [{
        deviceName: '/dev/xvda',
        volume: ec2.BlockDeviceVolume.ebs(8, {
          encrypted: true,
          deleteOnTermination: true,
          volumeType: ec2.EbsDeviceVolumeType.GP3,
        }),
      }],
    });

    // Create Auto Scaling Group
    this.autoScalingGroup = new autoscaling.AutoScalingGroup(this, `${appRole}-asg`, {
      vpc,
      mixedInstancesPolicy: {
        launchTemplate: launchTemplate,
      },
      minCapacity: 1,
      maxCapacity: 3,
      desiredCapacity: 1,
      cooldown: Duration.seconds(300),
      vpcSubnets: { subnetIds: subnets.map(subnet => subnet.subnetId) }, // Explicitly use subnet IDs
      maxInstanceLifetime: Duration.days(30),
    });

    this.autoScalingGroup.attachToApplicationTargetGroup(targetGroup);

    // Scale based on CPU utilization
    this.autoScalingGroup.scaleOnCpuUtilization(`${appRole}-cpu-scaling`, {
      targetUtilizationPercent: 55,
      cooldown: Duration.seconds(300),
    });

    new CfnOutput(this, 'AutoScalingGroupName', {
      value: this.autoScalingGroup.autoScalingGroupName,
      description: `${appRole} ASG Name`,
    });

    new CfnOutput(this, 'AutoScalingGroupArn', {
      value: this.autoScalingGroup.autoScalingGroupArn,
      description: `${appRole} ASG ARN`,
    });
  }
}