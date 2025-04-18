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

        const userData = ``;

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