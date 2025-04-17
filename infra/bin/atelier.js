import { App } from 'aws-cdk-lib';
import { NetworkStack } from '../lib/network-stack.js';
import { DatabaseStack } from '../lib/database-stack.js';

const app = new App();

new NetworkStack(app, 'NetworkStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});

new DatabaseStack(app, 'DatabaseStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});
