import { DeploymentEnvironment } from '@amzn/pipelines';
export declare const getAccountName: (stage: string, region: string) => string;
export interface StackProps {
    env: DeploymentEnvironment;
    stage: string;
}
