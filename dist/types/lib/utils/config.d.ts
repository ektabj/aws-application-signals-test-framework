import { DeploymentEnvironment, Platform } from '@amzn/pipelines';
import { Stage } from './constants';
export declare const APMPulseEnablementTestInfraPipelineProps: {
    account: string;
    pipelineName: string;
    versionSet: string;
    versionSetPlatform: Platform;
    trackingVersionSet: string;
    bindleGuid: string;
    description: string;
    pipelineId: string;
    notificationEmailAddress: string;
    selfMutate: boolean;
};
export declare const NewAccountEnvironment: DeploymentEnvironment;
export interface PipelineStage {
    readonly stageName: Stage;
    readonly regions: string[];
    readonly wave?: number;
}
export declare const pipelineStages: PipelineStage[];
export declare const e2eCanaryList: string[];
