"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.E2ETestCommonStack = void 0;
const pipelines_1 = require("@amzn/pipelines");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const xray = __importStar(require("aws-cdk-lib/aws-xray"));
const aws_iam_2 = require("aws-cdk-lib/aws-iam");
/*
This stack is for allocating resources that are needed by all the E2E tests in
https://github.com/aws-observability/aws-application-signals-test-framework
Generated resources:
- githubProviderRole: Role assumed by Github Action to connect to the Isengard Account
- xraySamplingRule: Change the rule to have a 100% sampling rate for traces
 */
class E2ETestCommonStack extends pipelines_1.DeploymentStack {
    constructor(parent, name, props) {
        super(parent, name, {
            ...props,
            softwareType: pipelines_1.SoftwareType.INFRASTRUCTURE,
        });
        // Create an IAM Role with OIDC Identity Provider
        const githubProvider = new aws_iam_1.OpenIdConnectProvider(this, 'githubProvider', {
            url: 'https://token.actions.githubusercontent.com',
            clientIds: ['sts.amazonaws.com'],
        });
        // Allow the following repositories to assume role with the IAM role
        // - aws-observability/aws-application-signals-test-framework
        // - aws-observability/aws-otel-python-instrumentation (temporarily until ADOT Python is public)
        // - aws-observability/aws-otel-dotnet-instrumentation (temporarily until ADOT Dotnet is public)
        const conditions = {
            StringLike: {
                ['token.actions.githubusercontent.com:sub']: [
                    'repo:aws-observability/aws-application-signals-test-framework:ref:refs/heads/*',
                    'repo:aws-observability/aws-otel-python-instrumentation:ref:refs/heads/*',
                    'repo:aws-observability/aws-otel-dotnet-instrumentation:ref:refs/heads/*',
                ],
            },
        };
        new aws_iam_1.Role(this, 'E2E_Test_GitHub_Role', {
            assumedBy: new aws_iam_2.CompositePrincipal(new aws_iam_1.WebIdentityPrincipal(githubProvider.openIdConnectProviderArn, conditions), new aws_iam_1.AccountRootPrincipal()),
            managedPolicies: [aws_iam_1.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')],
            roleName: 'E2E_Test_GitHub_Role',
        });
        // Create a new sampling rule for CloudWatch with a priority of one so that this rule takes priority over the default rule,
        // and change the fixedRate to 1 so that 100% of traces are sampled. If this is not defined, E2E testing trace validation step
        // may fail due to missing traces
        new xray.CfnSamplingRule(this, 'sampling-rate', {
            samplingRule: {
                ruleName: 'samplingRateRule',
                resourceArn: '*',
                priority: 1,
                fixedRate: 1,
                reservoirSize: 1,
                serviceName: '*',
                serviceType: '*',
                host: '*',
                httpMethod: '*',
                urlPath: '*',
                version: 1,
            },
        });
    }
}
exports.E2ETestCommonStack = E2ETestCommonStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZTJlVGVzdENvbW1vblN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbGliL3N0YWNrcy9lMmVUZXN0Q29tbW9uU3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSwrQ0FBZ0U7QUFFaEUsaURBTzZCO0FBQzdCLDJEQUE2QztBQUU3QyxpREFBeUQ7QUFFekQ7Ozs7OztHQU1HO0FBQ0gsTUFBYSxrQkFBbUIsU0FBUSwyQkFBZTtJQUNuRCxZQUFZLE1BQVcsRUFBRSxJQUFZLEVBQUUsS0FBaUI7UUFDcEQsS0FBSyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUU7WUFDaEIsR0FBRyxLQUFLO1lBQ1IsWUFBWSxFQUFFLHdCQUFZLENBQUMsY0FBYztTQUM1QyxDQUFDLENBQUM7UUFFSCxpREFBaUQ7UUFDakQsTUFBTSxjQUFjLEdBQUcsSUFBSSwrQkFBcUIsQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUU7WUFDckUsR0FBRyxFQUFFLDZDQUE2QztZQUNsRCxTQUFTLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQztTQUNuQyxDQUFDLENBQUM7UUFFSCxvRUFBb0U7UUFDcEUsNkRBQTZEO1FBQzdELGdHQUFnRztRQUNoRyxnR0FBZ0c7UUFDaEcsTUFBTSxVQUFVLEdBQWU7WUFDM0IsVUFBVSxFQUFFO2dCQUNSLENBQUMseUNBQXlDLENBQUMsRUFBRTtvQkFDekMsZ0ZBQWdGO29CQUNoRix5RUFBeUU7b0JBQ3pFLHlFQUF5RTtpQkFDNUU7YUFDSjtTQUNKLENBQUM7UUFFRixJQUFJLGNBQUksQ0FBQyxJQUFJLEVBQUUsb0JBQW9CLEVBQUU7WUFDakMsU0FBUyxFQUFFLElBQUksNEJBQWtCLENBQzdCLElBQUksOEJBQW9CLENBQUMsY0FBYyxDQUFDLHdCQUF3QixFQUFFLFVBQVUsQ0FBQyxFQUM3RSxJQUFJLDhCQUFvQixFQUFFLENBQzdCO1lBQ0QsZUFBZSxFQUFFLENBQUMsdUJBQWEsQ0FBQyx3QkFBd0IsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1lBQ2hGLFFBQVEsRUFBRSxvQkFBb0I7U0FDakMsQ0FBQyxDQUFDO1FBRUgsMkhBQTJIO1FBQzNILDhIQUE4SDtRQUM5SCxpQ0FBaUM7UUFDakMsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUU7WUFDNUMsWUFBWSxFQUFFO2dCQUNWLFFBQVEsRUFBRSxrQkFBa0I7Z0JBQzVCLFdBQVcsRUFBRSxHQUFHO2dCQUNoQixRQUFRLEVBQUUsQ0FBQztnQkFDWCxTQUFTLEVBQUUsQ0FBQztnQkFDWixhQUFhLEVBQUUsQ0FBQztnQkFDaEIsV0FBVyxFQUFFLEdBQUc7Z0JBQ2hCLFdBQVcsRUFBRSxHQUFHO2dCQUNoQixJQUFJLEVBQUUsR0FBRztnQkFDVCxVQUFVLEVBQUUsR0FBRztnQkFDZixPQUFPLEVBQUUsR0FBRztnQkFDWixPQUFPLEVBQUUsQ0FBQzthQUNiO1NBQ0osQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKO0FBdkRELGdEQXVEQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERlcGxveW1lbnRTdGFjaywgU29mdHdhcmVUeXBlIH0gZnJvbSAnQGFtem4vcGlwZWxpbmVzJztcbmltcG9ydCB7IEFwcCB9IGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7XG4gICAgQWNjb3VudFJvb3RQcmluY2lwYWwsXG4gICAgQ29uZGl0aW9ucyxcbiAgICBNYW5hZ2VkUG9saWN5LFxuICAgIE9wZW5JZENvbm5lY3RQcm92aWRlcixcbiAgICBSb2xlLFxuICAgIFdlYklkZW50aXR5UHJpbmNpcGFsLFxufSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcbmltcG9ydCAqIGFzIHhyYXkgZnJvbSAnYXdzLWNkay1saWIvYXdzLXhyYXknO1xuaW1wb3J0IHsgU3RhY2tQcm9wcyB9IGZyb20gJy4uL3V0aWxzL2NvbW1vbic7XG5pbXBvcnQgeyBDb21wb3NpdGVQcmluY2lwYWwgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcblxuLypcblRoaXMgc3RhY2sgaXMgZm9yIGFsbG9jYXRpbmcgcmVzb3VyY2VzIHRoYXQgYXJlIG5lZWRlZCBieSBhbGwgdGhlIEUyRSB0ZXN0cyBpblxuaHR0cHM6Ly9naXRodWIuY29tL2F3cy1vYnNlcnZhYmlsaXR5L2F3cy1hcHBsaWNhdGlvbi1zaWduYWxzLXRlc3QtZnJhbWV3b3JrXG5HZW5lcmF0ZWQgcmVzb3VyY2VzOlxuLSBnaXRodWJQcm92aWRlclJvbGU6IFJvbGUgYXNzdW1lZCBieSBHaXRodWIgQWN0aW9uIHRvIGNvbm5lY3QgdG8gdGhlIElzZW5nYXJkIEFjY291bnRcbi0geHJheVNhbXBsaW5nUnVsZTogQ2hhbmdlIHRoZSBydWxlIHRvIGhhdmUgYSAxMDAlIHNhbXBsaW5nIHJhdGUgZm9yIHRyYWNlc1xuICovXG5leHBvcnQgY2xhc3MgRTJFVGVzdENvbW1vblN0YWNrIGV4dGVuZHMgRGVwbG95bWVudFN0YWNrIHtcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQ6IEFwcCwgbmFtZTogc3RyaW5nLCBwcm9wczogU3RhY2tQcm9wcykge1xuICAgICAgICBzdXBlcihwYXJlbnQsIG5hbWUsIHtcbiAgICAgICAgICAgIC4uLnByb3BzLFxuICAgICAgICAgICAgc29mdHdhcmVUeXBlOiBTb2Z0d2FyZVR5cGUuSU5GUkFTVFJVQ1RVUkUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIENyZWF0ZSBhbiBJQU0gUm9sZSB3aXRoIE9JREMgSWRlbnRpdHkgUHJvdmlkZXJcbiAgICAgICAgY29uc3QgZ2l0aHViUHJvdmlkZXIgPSBuZXcgT3BlbklkQ29ubmVjdFByb3ZpZGVyKHRoaXMsICdnaXRodWJQcm92aWRlcicsIHtcbiAgICAgICAgICAgIHVybDogJ2h0dHBzOi8vdG9rZW4uYWN0aW9ucy5naXRodWJ1c2VyY29udGVudC5jb20nLFxuICAgICAgICAgICAgY2xpZW50SWRzOiBbJ3N0cy5hbWF6b25hd3MuY29tJ10sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEFsbG93IHRoZSBmb2xsb3dpbmcgcmVwb3NpdG9yaWVzIHRvIGFzc3VtZSByb2xlIHdpdGggdGhlIElBTSByb2xlXG4gICAgICAgIC8vIC0gYXdzLW9ic2VydmFiaWxpdHkvYXdzLWFwcGxpY2F0aW9uLXNpZ25hbHMtdGVzdC1mcmFtZXdvcmtcbiAgICAgICAgLy8gLSBhd3Mtb2JzZXJ2YWJpbGl0eS9hd3Mtb3RlbC1weXRob24taW5zdHJ1bWVudGF0aW9uICh0ZW1wb3JhcmlseSB1bnRpbCBBRE9UIFB5dGhvbiBpcyBwdWJsaWMpXG4gICAgICAgIC8vIC0gYXdzLW9ic2VydmFiaWxpdHkvYXdzLW90ZWwtZG90bmV0LWluc3RydW1lbnRhdGlvbiAodGVtcG9yYXJpbHkgdW50aWwgQURPVCBEb3RuZXQgaXMgcHVibGljKVxuICAgICAgICBjb25zdCBjb25kaXRpb25zOiBDb25kaXRpb25zID0ge1xuICAgICAgICAgICAgU3RyaW5nTGlrZToge1xuICAgICAgICAgICAgICAgIFsndG9rZW4uYWN0aW9ucy5naXRodWJ1c2VyY29udGVudC5jb206c3ViJ106IFtcbiAgICAgICAgICAgICAgICAgICAgJ3JlcG86YXdzLW9ic2VydmFiaWxpdHkvYXdzLWFwcGxpY2F0aW9uLXNpZ25hbHMtdGVzdC1mcmFtZXdvcms6cmVmOnJlZnMvaGVhZHMvKicsXG4gICAgICAgICAgICAgICAgICAgICdyZXBvOmF3cy1vYnNlcnZhYmlsaXR5L2F3cy1vdGVsLXB5dGhvbi1pbnN0cnVtZW50YXRpb246cmVmOnJlZnMvaGVhZHMvKicsXG4gICAgICAgICAgICAgICAgICAgICdyZXBvOmF3cy1vYnNlcnZhYmlsaXR5L2F3cy1vdGVsLWRvdG5ldC1pbnN0cnVtZW50YXRpb246cmVmOnJlZnMvaGVhZHMvKicsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG5cbiAgICAgICAgbmV3IFJvbGUodGhpcywgJ2dpdGh1YlByb3ZpZGVyUm9sZScsIHtcbiAgICAgICAgICAgIGFzc3VtZWRCeTogbmV3IENvbXBvc2l0ZVByaW5jaXBhbChcbiAgICAgICAgICAgICAgICBuZXcgV2ViSWRlbnRpdHlQcmluY2lwYWwoZ2l0aHViUHJvdmlkZXIub3BlbklkQ29ubmVjdFByb3ZpZGVyQXJuLCBjb25kaXRpb25zKSxcbiAgICAgICAgICAgICAgICBuZXcgQWNjb3VudFJvb3RQcmluY2lwYWwoKSxcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBtYW5hZ2VkUG9saWNpZXM6IFtNYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZSgnQWRtaW5pc3RyYXRvckFjY2VzcycpXSxcbiAgICAgICAgICAgIHJvbGVOYW1lOiAnZ2l0aHViUHJvdmlkZXJSb2xlJyxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGEgbmV3IHNhbXBsaW5nIHJ1bGUgZm9yIENsb3VkV2F0Y2ggd2l0aCBhIHByaW9yaXR5IG9mIG9uZSBzbyB0aGF0IHRoaXMgcnVsZSB0YWtlcyBwcmlvcml0eSBvdmVyIHRoZSBkZWZhdWx0IHJ1bGUsXG4gICAgICAgIC8vIGFuZCBjaGFuZ2UgdGhlIGZpeGVkUmF0ZSB0byAxIHNvIHRoYXQgMTAwJSBvZiB0cmFjZXMgYXJlIHNhbXBsZWQuIElmIHRoaXMgaXMgbm90IGRlZmluZWQsIEUyRSB0ZXN0aW5nIHRyYWNlIHZhbGlkYXRpb24gc3RlcFxuICAgICAgICAvLyBtYXkgZmFpbCBkdWUgdG8gbWlzc2luZyB0cmFjZXNcbiAgICAgICAgbmV3IHhyYXkuQ2ZuU2FtcGxpbmdSdWxlKHRoaXMsICdzYW1wbGluZy1yYXRlJywge1xuICAgICAgICAgICAgc2FtcGxpbmdSdWxlOiB7XG4gICAgICAgICAgICAgICAgcnVsZU5hbWU6ICdzYW1wbGluZ1JhdGVSdWxlJyxcbiAgICAgICAgICAgICAgICByZXNvdXJjZUFybjogJyonLFxuICAgICAgICAgICAgICAgIHByaW9yaXR5OiAxLFxuICAgICAgICAgICAgICAgIGZpeGVkUmF0ZTogMSxcbiAgICAgICAgICAgICAgICByZXNlcnZvaXJTaXplOiAxLFxuICAgICAgICAgICAgICAgIHNlcnZpY2VOYW1lOiAnKicsXG4gICAgICAgICAgICAgICAgc2VydmljZVR5cGU6ICcqJyxcbiAgICAgICAgICAgICAgICBob3N0OiAnKicsXG4gICAgICAgICAgICAgICAgaHR0cE1ldGhvZDogJyonLFxuICAgICAgICAgICAgICAgIHVybFBhdGg6ICcqJyxcbiAgICAgICAgICAgICAgICB2ZXJzaW9uOiAxLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIl19