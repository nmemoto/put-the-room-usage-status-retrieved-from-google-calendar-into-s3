import { Rule, Schedule } from '@aws-cdk/aws-events';
import * as eventsTargets from '@aws-cdk/aws-events-targets';
import * as lambda from '@aws-cdk/aws-lambda';
import * as nodejs from '@aws-cdk/aws-lambda-nodejs';
import * as logs from '@aws-cdk/aws-logs';
import * as cdk from '@aws-cdk/core';
import { Duration } from '@aws-cdk/core';

export class AppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const calendarIds: string[] = this.node.tryGetContext('calendarIds');

    const fn = new nodejs.NodejsFunction(this, 'TestFunction', {
      handler: 'handler',
      entry: 'app/lambda/index.ts',
      runtime: lambda.Runtime.NODEJS_12_X,
      logRetention: logs.RetentionDays.ONE_MONTH,
      timeout: Duration.seconds(10),
      environment: {
        "CALENDAR_IDS": calendarIds.join(",")
      }
   });

   const rule = new Rule(this, 'TestFunctionRule', {
      schedule: Schedule.expression("cron(0 21 * * ? *)"),
      targets: [
        new eventsTargets.LambdaFunction(fn)
      ]
    })
  }
}
