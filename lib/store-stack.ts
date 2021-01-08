import { Bucket, IBucket } from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';

export class StoreStack extends cdk.Stack {
  _bucket: IBucket
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, "calendarBucket", {
      versioned: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })
    this._bucket = bucket
  }

  bucket(): IBucket {
    return this._bucket;
  }
}
