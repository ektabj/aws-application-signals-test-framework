import { App } from 'aws-cdk-lib';
import { DeploymentStack } from '@amzn/pipelines';
import { StackProps } from '../../utils/common';
export declare class CWAgentOperatorPythonE2EReleaseTestingStack extends DeploymentStack {
    constructor(parent: App, name: string, props: StackProps);
}
