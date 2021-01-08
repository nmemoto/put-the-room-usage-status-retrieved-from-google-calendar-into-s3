#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { AppStack } from '../lib/app-stack';
import { StoreStack } from '../lib/store-stack';

const app = new cdk.App();
const storeStack = new StoreStack(app, 'StoreStack')
new AppStack(app, 'AppStack', storeStack.bucket());
