import { DeploymentStack, DeploymentStackProps } from '@amzn/pipelines';
import { Construct } from 'constructs';
interface ProdStorageStackProps extends DeploymentStackProps {
    prodAccounts: string[];
}
export declare class ProdStorageStack extends DeploymentStack {
    constructor(scope: Construct, id: string, props: ProdStorageStackProps);
}
export {};
