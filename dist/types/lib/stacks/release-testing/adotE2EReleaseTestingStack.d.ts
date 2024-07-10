import { DeploymentStack } from '@amzn/pipelines';
import { App } from 'aws-cdk-lib';
import { StackProps } from '../../utils/common';
export declare class AdotE2EReleaseTestingStack extends DeploymentStack {
    constructor(parent: App, name: string, props: StackProps);
}
