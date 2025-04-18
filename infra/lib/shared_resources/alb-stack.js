import { Stack, CfnOutput } from 'aws-cdk-lib';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';

export class BaseAlbStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // dynamic properties passed from frontend or backend stacks
    const {
      appRole,
      vpc,
      publicSubnets,
      securityGroup,
      listenerPorts,
      healthCheckPath,
      healthCheckPort,
    } = props;

    // Create the ALB with the existing security group
    this.loadBalancer = new elbv2.ApplicationLoadBalancer(this, `${appRole}-alb`, {
      vpc,
      internetFacing: true,
      securityGroup,
      vpcSubnets: { subnets: publicSubnets },
      loadBalancerName: `${appRole}-alb`
    });

    // Create target group
    this.targetGroup = new elbv2.ApplicationTargetGroup(this, `${appRole}-tg`, {
      vpc,
      port: healthCheckPort,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.INSTANCE,
      healthCheck: {
        path: healthCheckPath,
        timeout: 5,
        interval: 30,
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 2,
        port: healthCheckPort.toString()
      },
    });

    // Create listeners based on ports
    this.listeners = [];
    
    listenerPorts.forEach(port => {
      const listener = this.loadBalancer.addListener(
        `${appRole}-listener-${port}`, 
        {
          port,
          open: true,
          defaultTargetGroups: [this.targetGroup],
          protocol: elbv2.ApplicationProtocol.HTTP
        }
      );
      
      this.listeners.push(listener);
    });

    // Outputs
    new CfnOutput(this, 'LoadBalancerDnsName', {
      value: this.loadBalancer.loadBalancerDnsName,
      description: `${appRole} ALB DNS Name`
    });
    
    new CfnOutput(this, 'TargetGroupArn', {
      value: this.targetGroup.targetGroupArn
    });
    
    new CfnOutput(this, 'LoadBalancerArn', {
      value: this.loadBalancer.loadBalancerArn
    });
  }
}