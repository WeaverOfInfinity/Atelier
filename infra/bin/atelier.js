// bin/atelier.js
import { App } from 'aws-cdk-lib';
import { NetworkStack } from '../lib/network-stack.js';
import { DatabaseStack } from '../lib/database-stack.js';
import { BackendStack } from '../lib/backend-stack.js';

const app = new App();
const env = { 
  account: process.env.CDK_DEFAULT_ACCOUNT, 
  region: process.env.CDK_DEFAULT_REGION 
};

const networkStack = new NetworkStack(app, 'NetworkStack', { env });
new DatabaseStack(app, 'DatabaseStack', { env });

// Create a single backend stack that contains both ALB and ASG
const backendStack = new BackendStack(app, 'BackendStack', { env });
backendStack.addDependency(networkStack);