import { DeploymentPipeline, DeploymentPipelineProps } from '@amzn/pipelines';
import { App, Stack } from 'aws-cdk-lib';
import { PipelineStage } from '../utils/config';
import { Stage } from '../utils/constants';
export declare class APMPulseEnablementTestInfraPipeline extends DeploymentPipeline {
    accountIds: Record<string, string>[];
    constructor(app: App, props: DeploymentPipelineProps);
    getStages(): PipelineStage[];
    getAccountLookupStack(pipeline: APMPulseEnablementTestInfraPipeline, stageName: Stage, region: string): Stack;
    bootstrapStage(stage: PipelineStage, pipeline: APMPulseEnablementTestInfraPipeline): void;
    addTestingStage(pipeline: APMPulseEnablementTestInfraPipeline): void;
    addOTELPythonResourceStage(pipeline: APMPulseEnablementTestInfraPipeline): void;
}
