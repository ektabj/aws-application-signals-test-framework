import { IGrantable, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
interface S3BucketProps {
    bucketName: string;
    readAccounts: string[];
    readWriteRoles: IGrantable[];
    policy?: PolicyStatement;
}
export declare class S3Bucket extends Construct {
    readonly bucket: Bucket;
    constructor(scope: Construct, id: string, props: S3BucketProps);
}
export {};
