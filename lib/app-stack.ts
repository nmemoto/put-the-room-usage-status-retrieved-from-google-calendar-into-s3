import { Rule, Schedule } from '@aws-cdk/aws-events';
import * as eventsTargets from '@aws-cdk/aws-events-targets';
import * as lambda from '@aws-cdk/aws-lambda';
import * as nodejs from '@aws-cdk/aws-lambda-nodejs';
import * as logs from '@aws-cdk/aws-logs';
import * as cdk from '@aws-cdk/core';

export class AppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const fn = new nodejs.NodejsFunction(this, 'TestFunction', {
      handler: 'handler',
      entry: 'app/lambda/index.ts',
      runtime: lambda.Runtime.NODEJS_12_X,
      logRetention: logs.RetentionDays.ONE_MONTH
   });

   const rule = new Rule(this, 'TestFunctionRule', {
      schedule: Schedule.expression("cron(0/1 * * * ? *)"),
      targets: [
        new eventsTargets.LambdaFunction(fn)
      ]
    })
  }
}
