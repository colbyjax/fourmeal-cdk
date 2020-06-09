#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { FourmealCdkStack } from '../lib/fourmeal-cdk-stack';

const app = new cdk.App();
new FourmealCdkStack(app, 'FourmealCdkStack', {
    env: {
        region: 'us-west-1',
        account: '881191887789'
    }
});
