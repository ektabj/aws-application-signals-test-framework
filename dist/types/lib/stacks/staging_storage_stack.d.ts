import { DeploymentStack, DeploymentStackProps } from '@amzn/pipelines';
import { Construct } from 'constructs';
interface StorageStackProps extends DeploymentStackProps {
    stagingAccounts: string[];
    betaAccounts: string[];
}
export declare class StagingStorageStack extends DeploymentStack {
    constructor(scope: Construct, id: string, props: StorageStackProps);
}
export {};
