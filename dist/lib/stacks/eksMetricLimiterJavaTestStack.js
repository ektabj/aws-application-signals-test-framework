"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EksMetricLimiterJavaTestStack = void 0;
const pipelines_1 = require("@amzn/pipelines");
const aws_eks_1 = require("aws-cdk-lib/aws-eks");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const eks_cluster_1 = require("../constructs/eks-cluster");
// This stack allocates the necessary resources for running the E2E EKS Canary in
// https://github.com/aws-observability/aws-application-signals-test-framework/actions/workflows/appsignals-e2e-eks-canary-test.yml
class EksMetricLimiterJavaTestStack extends pipelines_1.DeploymentStack {
    constructor(parent, name, props) {
        super(parent, name, {
            ...props,
            softwareType: pipelines_1.SoftwareType.INFRASTRUCTURE,
        });
        // Retrieve the role that the github repository will be assuming to access the EKS cluster
        const role = aws_iam_1.Role.fromRoleName(this, 'githubProviderRole', 'githubProviderRole');
        const cluster = new eks_cluster_1.EKSCluster(this, 'e2e-metric-limiter-test', props.env.region, role);
        // Add OIDC provider config to the cluster
        new aws_eks_1.CfnIdentityProviderConfig(this, 'oidc-provider-configuration', {
            clusterName: cluster.clusterName,
            type: 'oidc',
            oidc: {
                clientId: 'sts.amazonaws.com',
                issuerUrl: 'https://token.actions.githubusercontent.com',
            },
        });
    }
}
exports.EksMetricLimiterJavaTestStack = EksMetricLimiterJavaTestStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWtzTWV0cmljTGltaXRlckphdmFUZXN0U3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvc3RhY2tzL2Vrc01ldHJpY0xpbWl0ZXJKYXZhVGVzdFN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtDQUFnRTtBQUVoRSxpREFBZ0U7QUFDaEUsaURBQTJDO0FBRTNDLDJEQUF1RDtBQUV2RCxpRkFBaUY7QUFDakYsbUlBQW1JO0FBQ25JLE1BQWEsNkJBQThCLFNBQVEsMkJBQWU7SUFDOUQsWUFBWSxNQUFXLEVBQUUsSUFBWSxFQUFFLEtBQWlCO1FBQ3BELEtBQUssQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFO1lBQ2hCLEdBQUcsS0FBSztZQUNSLFlBQVksRUFBRSx3QkFBWSxDQUFDLGNBQWM7U0FDNUMsQ0FBQyxDQUFDO1FBRUgsMEZBQTBGO1FBQzFGLE1BQU0sSUFBSSxHQUFHLGNBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLG9CQUFvQixFQUFFLG9CQUFvQixDQUFDLENBQUM7UUFDakYsTUFBTSxPQUFPLEdBQUcsSUFBSSx3QkFBVSxDQUFDLElBQUksRUFBRSx5QkFBeUIsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUV4RiwwQ0FBMEM7UUFDMUMsSUFBSSxtQ0FBeUIsQ0FBQyxJQUFJLEVBQUUsNkJBQTZCLEVBQUU7WUFDL0QsV0FBVyxFQUFFLE9BQU8sQ0FBQyxXQUFXO1lBQ2hDLElBQUksRUFBRSxNQUFNO1lBQ1osSUFBSSxFQUFFO2dCQUNGLFFBQVEsRUFBRSxtQkFBbUI7Z0JBQzdCLFNBQVMsRUFBRSw2Q0FBNkM7YUFDM0Q7U0FDSixDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUFyQkQsc0VBcUJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGVwbG95bWVudFN0YWNrLCBTb2Z0d2FyZVR5cGUgfSBmcm9tICdAYW16bi9waXBlbGluZXMnO1xuaW1wb3J0IHsgQXBwIH0gZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgQ2ZuSWRlbnRpdHlQcm92aWRlckNvbmZpZyB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1la3MnO1xuaW1wb3J0IHsgUm9sZSB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xuaW1wb3J0IHsgU3RhY2tQcm9wcyB9IGZyb20gJy4uL3V0aWxzL2NvbW1vbic7XG5pbXBvcnQgeyBFS1NDbHVzdGVyIH0gZnJvbSAnLi4vY29uc3RydWN0cy9la3MtY2x1c3Rlcic7XG5cbi8vIFRoaXMgc3RhY2sgYWxsb2NhdGVzIHRoZSBuZWNlc3NhcnkgcmVzb3VyY2VzIGZvciBydW5uaW5nIHRoZSBFMkUgRUtTIENhbmFyeSBpblxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2F3cy1vYnNlcnZhYmlsaXR5L2F3cy1hcHBsaWNhdGlvbi1zaWduYWxzLXRlc3QtZnJhbWV3b3JrL2FjdGlvbnMvd29ya2Zsb3dzL2FwcHNpZ25hbHMtZTJlLWVrcy1jYW5hcnktdGVzdC55bWxcbmV4cG9ydCBjbGFzcyBFa3NNZXRyaWNMaW1pdGVySmF2YVRlc3RTdGFjayBleHRlbmRzIERlcGxveW1lbnRTdGFjayB7XG4gICAgY29uc3RydWN0b3IocGFyZW50OiBBcHAsIG5hbWU6IHN0cmluZywgcHJvcHM6IFN0YWNrUHJvcHMpIHtcbiAgICAgICAgc3VwZXIocGFyZW50LCBuYW1lLCB7XG4gICAgICAgICAgICAuLi5wcm9wcyxcbiAgICAgICAgICAgIHNvZnR3YXJlVHlwZTogU29mdHdhcmVUeXBlLklORlJBU1RSVUNUVVJFLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBSZXRyaWV2ZSB0aGUgcm9sZSB0aGF0IHRoZSBnaXRodWIgcmVwb3NpdG9yeSB3aWxsIGJlIGFzc3VtaW5nIHRvIGFjY2VzcyB0aGUgRUtTIGNsdXN0ZXJcbiAgICAgICAgY29uc3Qgcm9sZSA9IFJvbGUuZnJvbVJvbGVOYW1lKHRoaXMsICdnaXRodWJQcm92aWRlclJvbGUnLCAnZ2l0aHViUHJvdmlkZXJSb2xlJyk7XG4gICAgICAgIGNvbnN0IGNsdXN0ZXIgPSBuZXcgRUtTQ2x1c3Rlcih0aGlzLCAnZTJlLW1ldHJpYy1saW1pdGVyLXRlc3QnLCBwcm9wcy5lbnYucmVnaW9uLCByb2xlKTtcblxuICAgICAgICAvLyBBZGQgT0lEQyBwcm92aWRlciBjb25maWcgdG8gdGhlIGNsdXN0ZXJcbiAgICAgICAgbmV3IENmbklkZW50aXR5UHJvdmlkZXJDb25maWcodGhpcywgJ29pZGMtcHJvdmlkZXItY29uZmlndXJhdGlvbicsIHtcbiAgICAgICAgICAgIGNsdXN0ZXJOYW1lOiBjbHVzdGVyLmNsdXN0ZXJOYW1lLFxuICAgICAgICAgICAgdHlwZTogJ29pZGMnLFxuICAgICAgICAgICAgb2lkYzoge1xuICAgICAgICAgICAgICAgIGNsaWVudElkOiAnc3RzLmFtYXpvbmF3cy5jb20nLFxuICAgICAgICAgICAgICAgIGlzc3VlclVybDogJ2h0dHBzOi8vdG9rZW4uYWN0aW9ucy5naXRodWJ1c2VyY29udGVudC5jb20nLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIl19