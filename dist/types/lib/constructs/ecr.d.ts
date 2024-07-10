import { Repository } from 'aws-cdk-lib/aws-ecr';
import { IGrantable, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
export interface ECRRepoProps {
    pullAccounts: string[];
    pushPullRoles: IGrantable[];
    name: string;
    policy?: PolicyStatement;
}
export declare class ECRRepo extends Construct {
    readonly ecr: Repository;
    constructor(scope: Construct, id: string, props: ECRRepoProps);
}
