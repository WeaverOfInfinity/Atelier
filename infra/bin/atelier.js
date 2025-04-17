#!/usr/bin/env node

const cdk = require('aws-cdk-lib');
const { NetworkStack } = require('../lib/network-stack');

const app = new cdk.App();

new NetworkStack(app, 'NetworkStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});