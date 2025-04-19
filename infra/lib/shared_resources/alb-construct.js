// lib/shared/alb-construct.js
import { Construct } from 'constructs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Duration, CfnOutput } from 'aws-cdk-lib';

export class AlbConstruct extends Construct {
  constructor(scope, id, props) {
    super(scope, id);
    
    const {
      appRole,
      vpc,
      subnets,
      securityGroup,
      listenerPorts,
      healthCheckPath,
      healthCheckPort,
    } = props;
    
    // Create ALB
    this.loadBalancer = new elbv2.ApplicationLoadBalancer(this, `${appRole}-alb`, {
      vpc,
      internetFacing: true,
      securityGroup,
      vpcSubnets: { subnets },
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
        interval: Duration.seconds(30),
        timeout: Duration.seconds(5),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 2,
        port: healthCheckPort.toString()
      },
    });
    
    // Create listeners
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
  }
}