import * as cdk from 'aws-cdk-lib';
import { aws_dynamodb as dynamodb } from 'aws-cdk-lib';

export class DatabaseStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const atelierTable = new dynamodb.CfnGlobalTable(this, 'AtelierDB', {
      tableName: 'AtelierDB',
      billingMode: 'PAY_PER_REQUEST', // On-demand mode
      attributeDefinitions: [
        { attributeName: 'PK', attributeType: 'S' },
        { attributeName: 'SK', attributeType: 'S' },
        { attributeName: 'category', attributeType: 'S' },
        { attributeName: 'price', attributeType: 'N' },
        { attributeName: 'GSI_PRODUCT_KEY', attributeType: 'S' },
        { attributeName: 'GSI_USERID', attributeType: 'S' },
        { attributeName: 'GSI_ORDER_DATE', attributeType: 'S' },
        { attributeName: 'created_at', attributeType: 'S' },
      ],
      timeToLiveSpecification: {
        attributeName: 'ttl',
        enabled: true
      },
      keySchema: [
        { attributeName: 'PK', keyType: 'HASH' },
        { attributeName: 'SK', keyType: 'RANGE' },
      ],
      replicas: [
        { region: 'af-south-1' },
        { region: 'eu-west-1' },
      ],
      streamSpecification: {
        streamViewType: 'NEW_AND_OLD_IMAGES',
      },
      globalSecondaryIndexes: [
        {
          indexName: 'GSI_AllProducts',
          keySchema: [
            { attributeName: 'GSI_PRODUCT_KEY', keyType: 'HASH' },
            { attributeName: 'PK', keyType: 'RANGE' },
          ],
          projection: { projectionType: 'ALL' },
        },
        {
          indexName: 'GSI_Category',
          keySchema: [
            { attributeName: 'category', keyType: 'HASH' },
            { attributeName: 'PK', keyType: 'RANGE' },
          ],
          projection: { projectionType: 'ALL' },
        },
        {
          indexName: 'GSI_CategoryPrice',
          keySchema: [
            { attributeName: 'category', keyType: 'HASH' },
            { attributeName: 'price', keyType: 'RANGE' },
          ],
          projection: { projectionType: 'ALL' },
        },
        {
          indexName: 'GSI_UserOrders',
          keySchema: [
            { attributeName: 'GSI_USERID', keyType: 'HASH' },
            { attributeName: 'PK', keyType: 'RANGE' },
          ],
          projection: { projectionType: 'ALL' },
        },
        {
          indexName: 'GSI_OrdersByDate',
          keySchema: [
            { attributeName: 'GSI_ORDER_DATE', keyType: 'HASH' },
            { attributeName: 'created_at', keyType: 'RANGE' },
          ],
          projection: { projectionType: 'ALL' },
        },
      ],
    });

    cdk.Tags.of(atelierTable).add('Name', 'AtelierDB');
    cdk.Tags.of(atelierTable).add('Realm', 'Database');

    new cdk.CfnOutput(this, 'TableName', {
      value: atelierTable.ref,
      description: 'DynamoDB table name',
    });

    new cdk.CfnOutput(this, 'TableArn', {
      value: atelierTable.attrArn,
      description: 'DynamoDB table ARN',
    });
  }
}
