import { IOpenIdConnectProvider } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
/**
 * Creates a new OpenID Provider using the github actions domain.
 */
export declare class GitHubOIDCProvider extends Construct {
    readonly githubProvider: IOpenIdConnectProvider;
    readonly domainName: string;
    constructor(scope: Construct, id: string);
}
