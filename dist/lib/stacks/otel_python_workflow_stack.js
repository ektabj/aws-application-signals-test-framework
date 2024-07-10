"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtelPythonWorkflowsStack = void 0;
const pipelines_1 = require("@amzn/pipelines");
const oidc_provider_1 = require("../constructs/oidc-provider");
const oidc_role_1 = require("../constructs/oidc-role");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const constants_1 = require("../utils/constants");
const aws_cdk_lib_1 = require("aws-cdk-lib");
/* Stack used to host roles used in the github workflows */
class OtelPythonWorkflowsStack extends pipelines_1.DeploymentStack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const githubOIDCProvider = new oidc_provider_1.GitHubOIDCProvider(this, 'GitHubOIDCProvider');
        const bucketWorkflowPolicyDocument = new aws_iam_1.PolicyDocument({
            statements: [
                new aws_iam_1.PolicyStatement({
                    effect: aws_iam_1.Effect.ALLOW,
                    actions: ['s3:putObject', 's3:getObject'],
                    resources: [
                        `arn:aws:s3:::${constants_1.S3_ADOT_PYTHON_STAGING}*/*`,
                        `arn:aws:s3:::${constants_1.S3_ADOT_PYTHON_NIGHTLY}*/*`,
                        `arn:aws:s3:::${constants_1.S3_ADOT_DOTNET_STAGING}*/*`,
                    ],
                }),
            ],
        });
        const ecrWorkflowPolicyDocument = new aws_iam_1.PolicyDocument({
            statements: [
                new aws_iam_1.PolicyStatement({
                    effect: aws_iam_1.Effect.ALLOW,
                    actions: ['ecr:GetAuthorizationToken'],
                    resources: ['*'],
                }),
                new aws_iam_1.PolicyStatement({
                    effect: aws_iam_1.Effect.ALLOW,
                    actions: [
                        'ecr:BatchCheckLayerAvailability',
                        'ecr:GetDownloadUrlForLayer',
                        'ecr:GetRepositoryPolicy',
                        'ecr:DescribeRepositories',
                        'ecr:ListImages',
                        'ecr:DescribeImages',
                        'ecr:BatchGetImage',
                        'ecr:InitiateLayerUpload',
                        'ecr:UploadLayerPart',
                        'ecr:CompleteLayerUpload',
                        'ecr:PutImage',
                    ],
                    resources: [
                        `arn:aws:ecr:*:${aws_cdk_lib_1.Stack.of(this).account}:repository/${constants_1.ECR_ADOT_PYTHON_NIGHTLY}`,
                        `arn:aws:ecr:*:${aws_cdk_lib_1.Stack.of(this).account}:repository/${constants_1.ECR_ADOT_PYTHON_STAGING}`,
                        `arn:aws:ecr:*:${aws_cdk_lib_1.Stack.of(this).account}:repository/${constants_1.ECR_ADOT_DOTNET_STAGING}`,
                    ],
                }),
            ],
        });
        // Policy for the PyPI Secrets used during releases
        const secretsManagerWorkflowPolicyDocument = new aws_iam_1.PolicyDocument({
            statements: [
                new aws_iam_1.PolicyStatement({
                    effect: aws_iam_1.Effect.ALLOW,
                    actions: ['secretsmanager:GetSecretValue', 'secretsmanager:ListSecrets'],
                    resources: [
                        `arn:aws:secretsmanager:us-east-1:637423224110:secret:${constants_1.SECRET_ADOT_PYTHON_PYPI_PROD}*`,
                        `arn:aws:secretsmanager:us-east-1:637423224110:secret:${constants_1.SECRET_ADOT_PYTHON_PYPI_TEST}*`,
                        `arn:aws:secretsmanager:us-east-1:637423224110:secret:${constants_1.SECRET_NVD_API_KEY}*`,
                    ],
                }),
            ],
        });
        new oidc_role_1.GitHubOidcIamRole(this, 'GitHubOidcIamRole', {
            githubProvider: githubOIDCProvider,
            roleName: constants_1.WORKFLOW_ROLE,
            repoConfigs: [{ organization: 'aws-observability', repository: 'aws-otel-python-instrumentation' }],
            inlinePolicies: {
                's3-workflow': bucketWorkflowPolicyDocument,
                'ecr-workflow': ecrWorkflowPolicyDocument,
                'secret-workflow': secretsManagerWorkflowPolicyDocument,
            },
        });
        /* ===== PROD STUFF =====*/
        // Policy for the ARS source ECR repo
        const ecrProdPolicyDocument = new aws_iam_1.PolicyDocument({
            statements: [
                new aws_iam_1.PolicyStatement({
                    effect: aws_iam_1.Effect.ALLOW,
                    actions: ['ecr:GetAuthorizationToken'],
                    resources: ['*'],
                }),
                new aws_iam_1.PolicyStatement({
                    effect: aws_iam_1.Effect.ALLOW,
                    actions: [
                        'ecr:BatchCheckLayerAvailability',
                        'ecr:GetDownloadUrlForLayer',
                        'ecr:GetRepositoryPolicy',
                        'ecr:DescribeRepositories',
                        'ecr:ListImages',
                        'ecr:DescribeImages',
                        'ecr:BatchGetImage',
                        'ecr:InitiateLayerUpload',
                        'ecr:UploadLayerPart',
                        'ecr:CompleteLayerUpload',
                        'ecr:PutImage',
                    ],
                    resources: [`arn:aws:ecr:*:${aws_cdk_lib_1.Stack.of(this).account}:repository/${constants_1.ECR_ADOT_PYTHON_ARS_SOURCE}`],
                }),
            ],
        });
        new oidc_role_1.GitHubOidcIamRole(this, 'GitHubOidcIamRoleForProd', {
            githubProvider: githubOIDCProvider,
            roleName: constants_1.GH_WORKFLOW_PROD_ROLE,
            repoConfigs: [
                { organization: 'aws-observability', repository: 'aws-otel-python-instrumentation' },
                { organization: 'aws-observability', repository: 'aws-otel-dotnet-instrumentation' },
            ],
            inlinePolicies: {
                'ecr-workflow': ecrProdPolicyDocument,
                'secret-workflow': secretsManagerWorkflowPolicyDocument,
            },
        });
    }
}
exports.OtelPythonWorkflowsStack = OtelPythonWorkflowsStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3RlbF9weXRob25fd29ya2Zsb3dfc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvc3RhY2tzL290ZWxfcHl0aG9uX3dvcmtmbG93X3N0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtDQUF3RTtBQUd4RSwrREFBaUU7QUFDakUsdURBQTREO0FBQzVELGlEQUE4RTtBQUM5RSxrREFhNEI7QUFDNUIsNkNBQW9DO0FBRXBDLDJEQUEyRDtBQUMzRCxNQUFhLHdCQUF5QixTQUFRLDJCQUFlO0lBQ3pELFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBMkI7UUFDakUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLGtDQUFrQixDQUFDLElBQUksRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1FBRTlFLE1BQU0sNEJBQTRCLEdBQUcsSUFBSSx3QkFBYyxDQUFDO1lBQ3BELFVBQVUsRUFBRTtnQkFDUixJQUFJLHlCQUFlLENBQUM7b0JBQ2hCLE1BQU0sRUFBRSxnQkFBTSxDQUFDLEtBQUs7b0JBQ3BCLE9BQU8sRUFBRSxDQUFDLGNBQWMsRUFBRSxjQUFjLENBQUM7b0JBQ3pDLFNBQVMsRUFBRTt3QkFDUCxnQkFBZ0Isa0NBQXNCLEtBQUs7d0JBQzNDLGdCQUFnQixrQ0FBc0IsS0FBSzt3QkFDM0MsZ0JBQWdCLGtDQUFzQixLQUFLO3FCQUM5QztpQkFDSixDQUFDO2FBQ0w7U0FDSixDQUFDLENBQUM7UUFFSCxNQUFNLHlCQUF5QixHQUFHLElBQUksd0JBQWMsQ0FBQztZQUNqRCxVQUFVLEVBQUU7Z0JBQ1IsSUFBSSx5QkFBZSxDQUFDO29CQUNoQixNQUFNLEVBQUUsZ0JBQU0sQ0FBQyxLQUFLO29CQUNwQixPQUFPLEVBQUUsQ0FBQywyQkFBMkIsQ0FBQztvQkFDdEMsU0FBUyxFQUFFLENBQUMsR0FBRyxDQUFDO2lCQUNuQixD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QUFFO2dCQUNwRixFQUFFLFlBQVksRUFBRSxtQkFBbUIsRUFBRSxVQUFVLEVBQUUsaUNBQWlDLEVBQUU7YUFDdkY7WUFDRCxjQUFjLEVBQUU7Z0JBQ1osY0FBYyxFQUFFLHFCQUFxQjtnQkFDckMsaUJBQWlCLEVBQUUsb0NBQW9DO2FBQzFEO1NBQ0osQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKO0FBeEhELDREQXdIQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERlcGxveW1lbnRTdGFjaywgRGVwbG95bWVudFN0YWNrUHJvcHMgfSBmcm9tICdAYW16bi9waXBlbGluZXMnO1xuXG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcbmltcG9ydCB7IEdpdEh1Yk9JRENQcm92aWRlciB9IGZyb20gJy4uL2NvbnN0cnVjdHMvb2lkYy1wcm92aWRlcic7XG5pbXBvcnQgeyBHaXRIdWJPaWRjSWFtUm9sZSB9IGZyb20gJy4uL2NvbnN0cnVjdHMvb2lkYy1yb2xlJztcbmltcG9ydCB7IEVmZmVjdCwgUG9saWN5RG9jdW1lbnQsIFBvbGljeVN0YXRlbWVudCB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xuaW1wb3J0IHtcbiAgICBFQ1JfQURPVF9ET1RORVRfU1RBR0lORyxcbiAgICBFQ1JfQURPVF9QWVRIT05fQVJTX1NPVVJDRSxcbiAgICBFQ1JfQURPVF9QWVRIT05fTklHSFRMWSxcbiAgICBFQ1JfQURPVF9QWVRIT05fU1RBR0lORyxcbiAgICBHSF9XT1JLRkxPV19QUk9EX1JPTEUsXG4gICAgUzNfQURPVF9ET1RORVRfU1RBR0lORyxcbiAgICBTM19BRE9UX1BZVEhPTl9OSUdIVExZLFxuICAgIFMzX0FET1RfUFlUSE9OX1NUQUdJTkcsXG4gICAgU0VDUkVUX0FET1RfUFlUSE9OX1BZUElfUFJPRCxcbiAgICBTRUNSRVRfQURPVF9QWVRIT05fUFlQSV9URVNULFxuICAgIFNFQ1JFVF9OVkRfQVBJX0tFWSxcbiAgICBXT1JLRkxPV19ST0xFLFxufSBmcm9tICcuLi91dGlscy9jb25zdGFudHMnO1xuaW1wb3J0IHsgU3RhY2sgfSBmcm9tICdhd3MtY2RrLWxpYic7XG5cbi8qIFN0YWNrIHVzZWQgdG8gaG9zdCByb2xlcyB1c2VkIGluIHRoZSBnaXRodWIgd29ya2Zsb3dzICovXG5leHBvcnQgY2xhc3MgT3RlbFB5dGhvbldvcmtmbG93c1N0YWNrIGV4dGVuZHMgRGVwbG95bWVudFN0YWNrIHtcbiAgICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogRGVwbG95bWVudFN0YWNrUHJvcHMpIHtcbiAgICAgICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICAgICAgY29uc3QgZ2l0aHViT0lEQ1Byb3ZpZGVyID0gbmV3IEdpdEh1Yk9JRENQcm92aWRlcih0aGlzLCAnR2l0SHViT0lEQ1Byb3ZpZGVyJyk7XG5cbiAgICAgICAgY29uc3QgYnVja2V0V29ya2Zsb3dQb2xpY3lEb2N1bWVudCA9IG5ldyBQb2xpY3lEb2N1bWVudCh7XG4gICAgICAgICAgICBzdGF0ZW1lbnRzOiBbXG4gICAgICAgICAgICAgICAgbmV3IFBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgICAgICAgICAgICAgIGVmZmVjdDogRWZmZWN0LkFMTE9XLFxuICAgICAgICAgICAgICAgICAgICBhY3Rpb25zOiBbJ3MzOnB1dE9iamVjdCcsICdzMzpnZXRPYmplY3QnXSxcbiAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2VzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBgYXJuOmF3czpzMzo6OiR7UzNfQURPVF9QWVRIT05fU1RBR0lOR30qLypgLFxuICAgICAgICAgICAgICAgICAgICAgICAgYGFybjphd3M6czM6Ojoke1MzX0FET1RfUFlUSE9OX05JR0hUTFl9Ki8qYCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGBhcm46YXdzOnMzOjo6JHtTM19BRE9UX0RPVE5FVF9TVEFHSU5HfSovKmAsXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBdLFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBlY3JXb3JrZmxvd1BvbGljeURvY3VtZW50ID0gbmV3IFBvbGljeURvY3VtZW50KHtcbiAgICAgICAgICAgIHN0YXRlbWVudHM6IFtcbiAgICAgICAgICAgICAgICBuZXcgUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICAgICAgICAgICAgZWZmZWN0OiBFZmZlY3QuQUxMT1csXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbnM6IFsnZWNyOkdldEF1dGhvcml6YXRpb25Ub2tlbiddLFxuICAgICAgICAgICAgICAgICAgICByZXNvdXJjZXM6IFsnKiddLFxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIG5ldyBQb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICAgICAgICAgICAgICBlZmZlY3Q6IEVmZmVjdC5BTExPVyxcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2VjcjpCYXRjaENoZWNrTGF5ZXJBdmFpbGFiaWxpdHknLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2VjcjpHZXREb3dubG9hZFVybEZvckxheWVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdlY3I6R2V0UmVwb3NpdG9yeVBvbGljeScsXG4gICAgICAgICAgICAgICAgICAgICAgICAnZWNyOkRlc2NyaWJlUmVwb3NpdG9yaWVzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdlY3I6TGlzdEltYWdlcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAnZWNyOkRlc2NyaWJlSW1hZ2VzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdlY3I6QmF0Y2hHZXRJbWFnZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAnZWNyOkluaXRpYXRlTGF5ZXJVcGxvYWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2VjcjpVcGxvYWRMYXllclBhcnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2VjcjpDb21wbGV0ZUxheWVyVXBsb2FkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdlY3I6UHV0SW1hZ2UnLFxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICByZXNvdXJjZXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIGBhcm46YXdzOmVjcjoqOiR7U3RhY2sub2YodGhpcykuYWNjb3VudH06cmVwb3NpdG9yeS8ke0VDUl9BRE9UX1BZVEhPTl9OSUdIVExZfWAsXG4gICAgICAgICAgICAgICAgICAgICAgICBgYXJuOmF3czplY3I6Kjoke1N0YWNrLm9mKHRoaXMpLmFjY291bnR9OnJlcG9zaXRvcnkvJHtFQ1JfQURPVF9QWVRIT05fU1RBR0lOR31gLFxuICAgICAgICAgICAgICAgICAgICAgICAgYGFybjphd3M6ZWNyOio6JHtTdGFjay5vZih0aGlzKS5hY2NvdW50fTpyZXBvc2l0b3J5LyR7RUNSX0FET1RfRE9UTkVUX1NUQUdJTkd9YCxcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFBvbGljeSBmb3IgdGhlIFB5UEkgU2VjcmV0cyB1c2VkIGR1cmluZyByZWxlYXNlc1xuICAgICAgICBjb25zdCBzZWNyZXRzTWFuYWdlcldvcmtmbG93UG9saWN5RG9jdW1lbnQgPSBuZXcgUG9saWN5RG9jdW1lbnQoe1xuICAgICAgICAgICAgc3RhdGVtZW50czogW1xuICAgICAgICAgICAgICAgIG5ldyBQb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICAgICAgICAgICAgICBlZmZlY3Q6IEVmZmVjdC5BTExPVyxcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uczogWydzZWNyZXRzbWFuYWdlcjpHZXRTZWNyZXRWYWx1ZScsICdzZWNyZXRzbWFuYWdlcjpMaXN0U2VjcmV0cyddLFxuICAgICAgICAgICAgICAgICAgICByZXNvdXJjZXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIGBhcm46YXdzOnNlY3JldHNtYW5hZ2VyOnVzLWVhc3QtMTo2Mzc0MjMyMjQxMTA6c2VjcmV0OiR7U0VDUkVUX0FET1RfUFlUSE9OX1BZUElfUFJPRH0qYCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGBhcm46YXdzOnNlY3JldHNtYW5hZ2VyOnVzLWVhc3QtMTo2Mzc0MjMyMjQxMTA6c2VjcmV0OiR7U0VDUkVUX0FET1RfUFlUSE9OX1BZUElfVEVTVH0qYCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGBhcm46YXdzOnNlY3JldHNtYW5hZ2VyOnVzLWVhc3QtMTo2Mzc0MjMyMjQxMTA6c2VjcmV0OiR7U0VDUkVUX05WRF9BUElfS0VZfSpgLFxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbmV3IEdpdEh1Yk9pZGNJYW1Sb2xlKHRoaXMsICdHaXRIdWJPaWRjSWFtUm9sZScsIHtcbiAgICAgICAgICAgIGdpdGh1YlByb3ZpZGVyOiBnaXRodWJPSURDUHJvdmlkZXIsXG4gICAgICAgICAgICByb2xlTmFtZTogV09SS0ZMT1dfUk9MRSxcbiAgICAgICAgICAgIHJlcG9Db25maWdzOiBbeyBvcmdhbml6YXRpb246ICdhd3Mtb2JzZXJ2YWJpbGl0eScsIHJlcG9zaXRvcnk6ICdhd3Mtb3RlbC1weXRob24taW5zdHJ1bWVudGF0aW9uJyB9XSxcbiAgICAgICAgICAgIGlubGluZVBvbGljaWVzOiB7XG4gICAgICAgICAgICAgICAgJ3MzLXdvcmtmbG93JzogYnVja2V0V29ya2Zsb3dQb2xpY3lEb2N1bWVudCxcbiAgICAgICAgICAgICAgICAnZWNyLXdvcmtmbG93JzogZWNyV29ya2Zsb3dQb2xpY3lEb2N1bWVudCxcbiAgICAgICAgICAgICAgICAnc2VjcmV0LXdvcmtmbG93Jzogc2VjcmV0c01hbmFnZXJXb3JrZmxvd1BvbGljeURvY3VtZW50LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLyogPT09PT0gUFJPRCBTVFVGRiA9PT09PSovXG5cbiAgICAgICAgLy8gUG9saWN5IGZvciB0aGUgQVJTIHNvdXJjZSBFQ1IgcmVwb1xuICAgICAgICBjb25zdCBlY3JQcm9kUG9saWN5RG9jdW1lbnQgPSBuZXcgUG9saWN5RG9jdW1lbnQoe1xuICAgICAgICAgICAgc3RhdGVtZW50czogW1xuICAgICAgICAgICAgICAgIG5ldyBQb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICAgICAgICAgICAgICBlZmZlY3Q6IEVmZmVjdC5BTExPVyxcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uczogWydlY3I6R2V0QXV0aG9yaXphdGlvblRva2VuJ10sXG4gICAgICAgICAgICAgICAgICAgIHJlc291cmNlczogWycqJ10sXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgbmV3IFBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgICAgICAgICAgICAgIGVmZmVjdDogRWZmZWN0LkFMTE9XLFxuICAgICAgICAgICAgICAgICAgICBhY3Rpb25zOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnZWNyOkJhdGNoQ2hlY2tMYXllckF2YWlsYWJpbGl0eScsXG4gICAgICAgICAgICAgICAgICAgICAgICAnZWNyOkdldERvd25sb2FkVXJsRm9yTGF5ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2VjcjpHZXRSZXBvc2l0b3J5UG9saWN5JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdlY3I6RGVzY3JpYmVSZXBvc2l0b3JpZXMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2VjcjpMaXN0SW1hZ2VzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdlY3I6RGVzY3JpYmVJbWFnZXMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2VjcjpCYXRjaEdldEltYWdlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdlY3I6SW5pdGlhdGVMYXllclVwbG9hZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAnZWNyOlVwbG9hZExheWVyUGFydCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAnZWNyOkNvbXBsZXRlTGF5ZXJVcGxvYWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2VjcjpQdXRJbWFnZScsXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIHJlc291cmNlczogW2Bhcm46YXdzOmVjcjoqOiR7U3RhY2sub2YodGhpcykuYWNjb3VudH06cmVwb3NpdG9yeS8ke0VDUl9BRE9UX1BZVEhPTl9BUlNfU09VUkNFfWBdLFxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbmV3IEdpdEh1Yk9pZGNJYW1Sb2xlKHRoaXMsICdHaXRIdWJPaWRjSWFtUm9sZUZvclByb2QnLCB7XG4gICAgICAgICAgICBnaXRodWJQcm92aWRlcjogZ2l0aHViT0lEQ1Byb3ZpZGVyLFxuICAgICAgICAgICAgcm9sZU5hbWU6IEdIX1dPUktGTE9XX1BST0RfUk9MRSxcbiAgICAgICAgICAgIHJlcG9Db25maWdzOiBbXG4gICAgICAgICAgICAgICAgeyBvcmdhbml6YXRpb246ICdhd3Mtb2JzZXJ2YWJpbGl0eScsIHJlcG9zaXRvcnk6ICdhd3Mtb3RlbC1weXRob24taW5zdHJ1bWVudGF0aW9uJyB9LFxuICAgICAgICAgICAgICAgIHsgb3JnYW5pemF0aW9uOiAnYXdzLW9ic2VydmFiaWxpdHknLCByZXBvc2l0b3J5OiAnYXdzLW90ZWwtZG90bmV0LWluc3RydW1lbnRhdGlvbicgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBpbmxpbmVQb2xpY2llczoge1xuICAgICAgICAgICAgICAgICdlY3Itd29ya2Zsb3cnOiBlY3JQcm9kUG9saWN5RG9jdW1lbnQsXG4gICAgICAgICAgICAgICAgJ3NlY3JldC13b3JrZmxvdyc6IHNlY3JldHNNYW5hZ2VyV29ya2Zsb3dQb2xpY3lEb2N1bWVudCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiJdfQ==