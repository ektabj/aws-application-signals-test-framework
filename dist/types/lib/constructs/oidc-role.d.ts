import { IManagedPolicy, PolicyDocument } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { GitHubOIDCProvider } from './oidc-provider';
/**
 * @param roleName - the name of the IAM Role
 * @param repoConfigs - A list of organizations and repositories that will be mapped into the IAM Role Conditions.
 * Uses a StringLike match and can thus use * and ? for character replacement.
 * @see {@link https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_condition_operators.html#Conditions_String}
 * for more information.
 * @param managedPolicies - a list of AWS Managed policies to add to the IAM Role
 * @param inlinePolicies - a list of inline policies to add to the IAM Role
 * @param gitHubProvider - GitHub OIDC Provider
 */
export interface GitHubOidcIamRoleProps {
    roleName: string;
    repoConfigs: {
        organization: string;
        repository: string;
    }[];
    managedPolicies?: IManagedPolicy[];
    inlinePolicies?: {
        [name: string]: PolicyDocument;
    };
    githubProvider: GitHubOIDCProvider;
}
/**
 * @remark This construct deploys a single IAM Role which will utilize the GitHub
 * OIDC Provider as a WebIdentity. This Role can then be assumed in a
 * GitHub Actions workflow run from any of the repositories listed in the
 * repoConfigs object array.
 */
export declare class GitHubOidcIamRole extends Construct {
    constructor(scope: Construct, id: string, props: GitHubOidcIamRoleProps);
}
