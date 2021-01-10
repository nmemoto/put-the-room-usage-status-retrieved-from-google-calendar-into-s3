import { Rule, Schedule } from '@aws-cdk/aws-events';
import * as eventsTargets from '@aws-cdk/aws-events-targets';
import * as lambda from '@aws-cdk/aws-lambda';
import * as nodejs from '@aws-cdk/aws-lambda-nodejs';
import * as logs from '@aws-cdk/aws-logs';
import { IBucket } from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';
import { Duration } from '@aws-cdk/core';

export class AppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, bucket: IBucket, props?: cdk.StackProps) {
    super(scope, id, props);

    const calendarList: string[] = this.node.tryGetContext('calendarList');

    const fn = new nodejs.NodejsFunction(this, 'TestFunction', {
      handler: 'handler',
      entry: 'app/lambda/index.ts',
      runtime: lambda.Runtime.NODEJS_12_X,
      logRetention: logs.RetentionDays.ONE_MONTH,
      timeout: Duration.seconds(10),
      environment: {
        "CALENDAR_LIST": JSON.stringify(calendarList),
        "BUCKET_NAME": bucket.bucketName,
      }
   });

   const rule = new Rule(this, 'TestFunctionRule', {
      schedule: Schedule.expression("cron(0 21 * * ? *)"),
      targets: [
        new eventsTargets.LambdaFunction(fn)
      ]
    })

    bucket.grantReadWrite(fn)
  }
}
