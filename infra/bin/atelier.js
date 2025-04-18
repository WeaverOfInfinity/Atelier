import { App } from 'aws-cdk-lib';
import { NetworkStack } from '../lib/network-stack.js';
import { DatabaseStack } from '../lib/database-stack.js';
import { BackendStack } from '../lib/backend-stack.js';

const app = new App();

const networkStack = new NetworkStack(app, 'NetworkStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});

new DatabaseStack(app, 'DatabaseStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});

const backendStack = new BackendStack(app, 'BackendStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  networkStack: networkStack,
});