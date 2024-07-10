import { Cluster } from 'aws-cdk-lib/aws-eks';
import { IRole } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
export declare class EKSCluster extends Cluster {
    constructor(scope: Construct, clusterName: string, region: string, role: IRole);
}
