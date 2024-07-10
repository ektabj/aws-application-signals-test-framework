"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CWAgentOperatorE2EReleaseTestingStack = void 0;
const pipelines_1 = require("@amzn/pipelines");
const aws_eks_1 = require("aws-cdk-lib/aws-eks");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const aws_ec2_1 = require("aws-cdk-lib/aws-ec2");
const aws_rds_1 = require("aws-cdk-lib/aws-rds");
/*
This stack is for creating an EKS Cluster for release testing in the following repo:
https://github.com/aws/amazon-cloudwatch-agent-operator
*/
class CWAgentOperatorE2EReleaseTestingStack extends pipelines_1.DeploymentStack {
    constructor(parent, name, props) {
        var _a;
        super(parent, name, {
            ...props,
            softwareType: pipelines_1.SoftwareType.INFRASTRUCTURE,
        });
        // Allow the aws/amazon-cloudwatch-agent-operator repo to assume role with the IAM role
        const conditions = {
            StringLike: {
                ['token.actions.githubusercontent.com:sub']: 'repo:aws/amazon-cloudwatch-agent-operator:ref:refs/heads/*',
            },
        };
        // Create an IAM Role with an existing OIDC Identity Provider created in ../e2eTestCommonStack.ts
        const role = new aws_iam_1.Role(this, 'CW-Agent-Operator-E2E-Github-Provider-Role', {
            assumedBy: new aws_iam_1.WebIdentityPrincipal('arn:aws:iam::654654176582:oidc-provider/token.actions.githubusercontent.com', conditions),
            managedPolicies: [aws_iam_1.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')],
            roleName: 'CW-Agent-Operator-E2E-Github-Provider-Role',
        });
        // This allows developers to access the EKS cluster manually on the terminal
        (_a = role.assumeRolePolicy) === null || _a === void 0 ? void 0 : _a.addStatements(new aws_iam_1.PolicyStatement({
            actions: ['sts:AssumeRole'],
            principals: [new aws_iam_1.AccountRootPrincipal()],
        }));
        // Create an EKS cluster with a load balancer that will run the E2E tests
        const cluster = new aws_eks_1.Cluster(this, `e2e-cw-agent-operator-test`, {
            version: aws_eks_1.KubernetesVersion.V1_27,
            clusterName: `e2e-cw-agent-operator-test`,
            albController: { version: aws_eks_1.AlbControllerVersion.V2_4_7 },
            mastersRole: role,
        });
        new aws_eks_1.CfnIdentityProviderConfig(this, `adot-oidc-provider-configuration`, {
            clusterName: cluster.clusterName,
            type: 'oidc',
            oidc: {
                clientId: 'sts.amazonaws.com',
                issuerUrl: 'https://token.actions.githubusercontent.com',
            },
        });
        const rdsSecurityGroup = new aws_ec2_1.SecurityGroup(this, 'RdsSecurityGroup', {
            vpc: cluster.vpc,
            description: 'Security group for RDS Aurora cluster',
            allowAllOutbound: true,
        });
        // Add ingress rule to allow access from all IPv4 addresses
        rdsSecurityGroup.addIngressRule(aws_ec2_1.Peer.anyIpv4(), aws_ec2_1.Port.tcp(3306), 'Allow MySQL access from all IPv4');
        const rdsCluster = new aws_rds_1.DatabaseCluster(this, 'RdsAuroraCWAgentOperatorE2EClusterForMySQL', {
            engine: aws_rds_1.DatabaseClusterEngine.auroraMysql({ version: aws_rds_1.AuroraMysqlEngineVersion.VER_3_04_1 }),
            clusterIdentifier: 'RdsAuroraCWAgentOperatorE2EClusterForMySQL',
            storageType: aws_rds_1.DBClusterStorageType.AURORA,
            vpc: cluster.vpc,
            writer: aws_rds_1.ClusterInstance.provisioned('writer'),
            readers: [aws_rds_1.ClusterInstance.provisioned('reader')],
            deletionProtection: true,
            storageEncrypted: true,
            securityGroups: [rdsSecurityGroup],
        });
        const rdsClusterL1Construct = rdsCluster.node.defaultChild;
        rdsClusterL1Construct.addPropertyOverride('ManageMasterUserPassword', true);
        rdsClusterL1Construct.addPropertyOverride('MasterUsername', 'admin');
        rdsClusterL1Construct.addPropertyDeletionOverride('MasterUserPassword');
    }
}
exports.CWAgentOperatorE2EReleaseTestingStack = CWAgentOperatorE2EReleaseTestingStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3dBZ2VudE9wZXJhdG9yRTJFUmVsZWFzZVRlc3RpbmdTdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYi9zdGFja3MvcmVsZWFzZS10ZXN0aW5nL2N3QWdlbnRPcGVyYXRvckUyRVJlbGVhc2VUZXN0aW5nU3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsK0NBQWdFO0FBQ2hFLGlEQUFrSDtBQUNsSCxpREFPNkI7QUFFN0IsaURBQWdFO0FBQ2hFLGlEQU82QjtBQUU3Qjs7O0VBR0U7QUFDRixNQUFhLHFDQUFzQyxTQUFRLDJCQUFlO0lBQ3RFLFlBQVksTUFBVyxFQUFFLElBQVksRUFBRSxLQUFpQjs7UUFDcEQsS0FBSyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUU7WUFDaEIsR0FBRyxLQUFLO1lBQ1IsWUFBWSxFQUFFLHdCQUFZLENBQUMsY0FBYztTQUM1QyxDQUFDLENBQUM7UUFFSCx1RkFBdUY7UUFDdkYsTUFBTSxVQUFVLEdBQWU7WUFDM0IsVUFBVSxFQUFFO2dCQUNSLENBQUMseUNBQXlDLENBQUMsRUFDdkMsNERBQTREO2FBQ25FO1NBQ0osQ0FBQztRQUVGLGlHQUFpRztRQUNqRyxNQUFNLElBQUksR0FBRyxJQUFJLGNBQUksQ0FBQyxJQUFJLEVBQUUsNENBQTRDLEVBQUU7WUFDdEUsU0FBUyxFQUFFLElBQUksOEJBQW9CLENBQy9CLDZFQUE2RSxFQUM3RSxVQUFVLENBQ2I7WUFDRCxlQUFlLEVBQUUsQ0FBQyx1QkFBYSxDQUFDLHdCQUF3QixDQUFDLHFCQUFxQixDQUFDLENBQUM7WUFDaEYsUUFBUSxFQUFFLDRDQUE0QztTQUN6RCxDQUFDLENBQUM7UUFFSCw0RUFBNEU7UUFDNUUsTUFBQSxJQUFJLENBQUMsZ0JBQWdCLDBDQUFFLGFBQWEsQ0FDaEMsSUFBSSx5QkFBZSxDQUFDO1lBQ2hCLE9BQU8sRUFBRSxDQUFDLGdCQUFnQixDQUFDO1lBQzNCLFVBQVUsRUFBRSxDQUFDLElBQUksOEJBQW9CLEVBQUUsQ0FBQztTQUMzQyxDQUFDLENBQ0wsQ0FBQztRQUVGLHlFQUF5RTtRQUN6RSxNQUFNLE9BQU8sR0FBRyxJQUFJLGlCQUFPLENBQUMsSUFBSSxFQUFFLDRCQUE0QixFQUFFO1lBQzVELE9BQU8sRUFBRSwyQkFBaUIsQ0FBQyxLQUFLO1lBQ2hDLFdBQVcsRUFBRSw0QkFBNEI7WUFDekMsYUFBYSxFQUFFLEVBQUUsT0FBTyxFQUFFLDhCQUFvQixDQUFDLE1BQU0sRUFBRTtZQUN2RCxXQUFXLEVBQUUsSUFBSTtTQUNwQixDQUFDLENBQUM7UUFFSCxJQUFJLG1DQUF5QixDQUFDLElBQUksRUFBRSxrQ0FBa0MsRUFBRTtZQUNwRSxXQUFXLEVBQUUsT0FBTyxDQUFDLFdBQVc7WUFDaEMsSUFBSSxFQUFFLE1BQU07WUFDWixJQUFJLEVBQUU7Z0JBQ0YsUUFBUSxFQUFFLG1CQUFtQjtnQkFDN0IsU0FBUyxFQUFFLDZDQUE2QzthQUMzRDtTQUNKLENBQUMsQ0FBQztRQUVILE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSx1QkFBYSxDQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRTtZQUNqRSxHQUFHLEVBQUUsT0FBTyxDQUFDLEdBQUc7WUFDaEIsV0FBVyxFQUFFLHVDQUF1QztZQUNwRCxnQkFBZ0IsRUFBRSxJQUFJO1NBQ3pCLENBQUMsQ0FBQztRQUVILDJEQUEyRDtRQUMzRCxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsY0FBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLGNBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsa0NBQWtDLENBQUMsQ0FBQztRQUVwRyxNQUFNLFVBQVUsR0FBRyxJQUFJLHlCQUFlLENBQUMsSUFBSSxFQUFFLDRDQUE0QyxFQUFFO1lBQ3ZGLE1BQU0sRUFBRSwrQkFBcUIsQ0FBQyxXQUFXLENBQUMsRUFBRSxPQUFPLEVBQUUsa0NBQXdCLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDM0YsaUJBQWlCLEVBQUUsNENBQTRDO1lBQy9ELFdBQVcsRUFBRSw4QkFBb0IsQ0FBQyxNQUFNO1lBQ3hDLEdBQUcsRUFBRSxPQUFPLENBQUMsR0FBRztZQUNoQixNQUFNLEVBQUUseUJBQWUsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO1lBQzdDLE9BQU8sRUFBRSxDQUFDLHlCQUFlLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2hELGtCQUFrQixFQUFFLElBQUk7WUFDeEIsZ0JBQWdCLEVBQUUsSUFBSTtZQUN0QixjQUFjLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQztTQUNyQyxDQUFDLENBQUM7UUFFSCxNQUFNLHFCQUFxQixHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsWUFBNEIsQ0FBQztRQUMzRSxxQkFBcUIsQ0FBQyxtQkFBbUIsQ0FBQywwQkFBMEIsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM1RSxxQkFBcUIsQ0FBQyxtQkFBbUIsQ0FBQyxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNyRSxxQkFBcUIsQ0FBQywyQkFBMkIsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0lBQzVFLENBQUM7Q0FDSjtBQTVFRCxzRkE0RUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHAgfSBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBEZXBsb3ltZW50U3RhY2ssIFNvZnR3YXJlVHlwZSB9IGZyb20gJ0BhbXpuL3BpcGVsaW5lcyc7XG5pbXBvcnQgeyBDbHVzdGVyLCBLdWJlcm5ldGVzVmVyc2lvbiwgQWxiQ29udHJvbGxlclZlcnNpb24sIENmbklkZW50aXR5UHJvdmlkZXJDb25maWcgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWtzJztcbmltcG9ydCB7XG4gICAgUm9sZSxcbiAgICBXZWJJZGVudGl0eVByaW5jaXBhbCxcbiAgICBNYW5hZ2VkUG9saWN5LFxuICAgIENvbmRpdGlvbnMsXG4gICAgQWNjb3VudFJvb3RQcmluY2lwYWwsXG4gICAgUG9saWN5U3RhdGVtZW50LFxufSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcbmltcG9ydCB7IFN0YWNrUHJvcHMgfSBmcm9tICcuLi8uLi91dGlscy9jb21tb24nO1xuaW1wb3J0IHsgUGVlciwgUG9ydCwgU2VjdXJpdHlHcm91cCB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1lYzInO1xuaW1wb3J0IHtcbiAgICBEYXRhYmFzZUNsdXN0ZXIsXG4gICAgRGF0YWJhc2VDbHVzdGVyRW5naW5lLFxuICAgIEF1cm9yYU15c3FsRW5naW5lVmVyc2lvbixcbiAgICBEQkNsdXN0ZXJTdG9yYWdlVHlwZSxcbiAgICBDbHVzdGVySW5zdGFuY2UsXG4gICAgQ2ZuREJDbHVzdGVyLFxufSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtcmRzJztcblxuLypcblRoaXMgc3RhY2sgaXMgZm9yIGNyZWF0aW5nIGFuIEVLUyBDbHVzdGVyIGZvciByZWxlYXNlIHRlc3RpbmcgaW4gdGhlIGZvbGxvd2luZyByZXBvOlxuaHR0cHM6Ly9naXRodWIuY29tL2F3cy9hbWF6b24tY2xvdWR3YXRjaC1hZ2VudC1vcGVyYXRvclxuKi9cbmV4cG9ydCBjbGFzcyBDV0FnZW50T3BlcmF0b3JFMkVSZWxlYXNlVGVzdGluZ1N0YWNrIGV4dGVuZHMgRGVwbG95bWVudFN0YWNrIHtcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQ6IEFwcCwgbmFtZTogc3RyaW5nLCBwcm9wczogU3RhY2tQcm9wcykge1xuICAgICAgICBzdXBlcihwYXJlbnQsIG5hbWUsIHtcbiAgICAgICAgICAgIC4uLnByb3BzLFxuICAgICAgICAgICAgc29mdHdhcmVUeXBlOiBTb2Z0d2FyZVR5cGUuSU5GUkFTVFJVQ1RVUkUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEFsbG93IHRoZSBhd3MvYW1hem9uLWNsb3Vkd2F0Y2gtYWdlbnQtb3BlcmF0b3IgcmVwbyB0byBhc3N1bWUgcm9sZSB3aXRoIHRoZSBJQU0gcm9sZVxuICAgICAgICBjb25zdCBjb25kaXRpb25zOiBDb25kaXRpb25zID0ge1xuICAgICAgICAgICAgU3RyaW5nTGlrZToge1xuICAgICAgICAgICAgICAgIFsndG9rZW4uYWN0aW9ucy5naXRodWJ1c2VyY29udGVudC5jb206c3ViJ106XG4gICAgICAgICAgICAgICAgICAgICdyZXBvOmF3cy9hbWF6b24tY2xvdWR3YXRjaC1hZ2VudC1vcGVyYXRvcjpyZWY6cmVmcy9oZWFkcy8qJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gQ3JlYXRlIGFuIElBTSBSb2xlIHdpdGggYW4gZXhpc3RpbmcgT0lEQyBJZGVudGl0eSBQcm92aWRlciBjcmVhdGVkIGluIC4uL2UyZVRlc3RDb21tb25TdGFjay50c1xuICAgICAgICBjb25zdCByb2xlID0gbmV3IFJvbGUodGhpcywgJ0NXLUFnZW50LU9wZXJhdG9yLUUyRS1HaXRodWItUHJvdmlkZXItUm9sZScsIHtcbiAgICAgICAgICAgIGFzc3VtZWRCeTogbmV3IFdlYklkZW50aXR5UHJpbmNpcGFsKFxuICAgICAgICAgICAgICAgICdhcm46YXdzOmlhbTo6NjU0NjU0MTc2NTgyOm9pZGMtcHJvdmlkZXIvdG9rZW4uYWN0aW9ucy5naXRodWJ1c2VyY29udGVudC5jb20nLFxuICAgICAgICAgICAgICAgIGNvbmRpdGlvbnMsXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgbWFuYWdlZFBvbGljaWVzOiBbTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoJ0FkbWluaXN0cmF0b3JBY2Nlc3MnKV0sXG4gICAgICAgICAgICByb2xlTmFtZTogJ0NXLUFnZW50LU9wZXJhdG9yLUUyRS1HaXRodWItUHJvdmlkZXItUm9sZScsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFRoaXMgYWxsb3dzIGRldmVsb3BlcnMgdG8gYWNjZXNzIHRoZSBFS1MgY2x1c3RlciBtYW51YWxseSBvbiB0aGUgdGVybWluYWxcbiAgICAgICAgcm9sZS5hc3N1bWVSb2xlUG9saWN5Py5hZGRTdGF0ZW1lbnRzKFxuICAgICAgICAgICAgbmV3IFBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgICAgICAgICAgYWN0aW9uczogWydzdHM6QXNzdW1lUm9sZSddLFxuICAgICAgICAgICAgICAgIHByaW5jaXBhbHM6IFtuZXcgQWNjb3VudFJvb3RQcmluY2lwYWwoKV0sXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBDcmVhdGUgYW4gRUtTIGNsdXN0ZXIgd2l0aCBhIGxvYWQgYmFsYW5jZXIgdGhhdCB3aWxsIHJ1biB0aGUgRTJFIHRlc3RzXG4gICAgICAgIGNvbnN0IGNsdXN0ZXIgPSBuZXcgQ2x1c3Rlcih0aGlzLCBgZTJlLWN3LWFnZW50LW9wZXJhdG9yLXRlc3RgLCB7XG4gICAgICAgICAgICB2ZXJzaW9uOiBLdWJlcm5ldGVzVmVyc2lvbi5WMV8yNyxcbiAgICAgICAgICAgIGNsdXN0ZXJOYW1lOiBgZTJlLWN3LWFnZW50LW9wZXJhdG9yLXRlc3RgLFxuICAgICAgICAgICAgYWxiQ29udHJvbGxlcjogeyB2ZXJzaW9uOiBBbGJDb250cm9sbGVyVmVyc2lvbi5WMl80XzcgfSxcbiAgICAgICAgICAgIG1hc3RlcnNSb2xlOiByb2xlLFxuICAgICAgICB9KTtcblxuICAgICAgICBuZXcgQ2ZuSWRlbnRpdHlQcm92aWRlckNvbmZpZyh0aGlzLCBgYWRvdC1vaWRjLXByb3ZpZGVyLWNvbmZpZ3VyYXRpb25gLCB7XG4gICAgICAgICAgICBjbHVzdGVyTmFtZTogY2x1c3Rlci5jbHVzdGVyTmFtZSxcbiAgICAgICAgICAgIHR5cGU6ICdvaWRjJyxcbiAgICAgICAgICAgIG9pZGM6IHtcbiAgICAgICAgICAgICAgICBjbGllbnRJZDogJ3N0cy5hbWF6b25hd3MuY29tJyxcbiAgICAgICAgICAgICAgICBpc3N1ZXJVcmw6ICdodHRwczovL3Rva2VuLmFjdGlvbnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHJkc1NlY3VyaXR5R3JvdXAgPSBuZXcgU2VjdXJpdHlHcm91cCh0aGlzLCAnUmRzU2VjdXJpdHlHcm91cCcsIHtcbiAgICAgICAgICAgIHZwYzogY2x1c3Rlci52cGMsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1NlY3VyaXR5IGdyb3VwIGZvciBSRFMgQXVyb3JhIGNsdXN0ZXInLFxuICAgICAgICAgICAgYWxsb3dBbGxPdXRib3VuZDogdHJ1ZSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQWRkIGluZ3Jlc3MgcnVsZSB0byBhbGxvdyBhY2Nlc3MgZnJvbSBhbGwgSVB2NCBhZGRyZXNzZXNcbiAgICAgICAgcmRzU2VjdXJpdHlHcm91cC5hZGRJbmdyZXNzUnVsZShQZWVyLmFueUlwdjQoKSwgUG9ydC50Y3AoMzMwNiksICdBbGxvdyBNeVNRTCBhY2Nlc3MgZnJvbSBhbGwgSVB2NCcpO1xuXG4gICAgICAgIGNvbnN0IHJkc0NsdXN0ZXIgPSBuZXcgRGF0YWJhc2VDbHVzdGVyKHRoaXMsICdSZHNBdXJvcmFDV0FnZW50T3BlcmF0b3JFMkVDbHVzdGVyRm9yTXlTUUwnLCB7XG4gICAgICAgICAgICBlbmdpbmU6IERhdGFiYXNlQ2x1c3RlckVuZ2luZS5hdXJvcmFNeXNxbCh7IHZlcnNpb246IEF1cm9yYU15c3FsRW5naW5lVmVyc2lvbi5WRVJfM18wNF8xIH0pLFxuICAgICAgICAgICAgY2x1c3RlcklkZW50aWZpZXI6ICdSZHNBdXJvcmFDV0FnZW50T3BlcmF0b3JFMkVDbHVzdGVyRm9yTXlTUUwnLFxuICAgICAgICAgICAgc3RvcmFnZVR5cGU6IERCQ2x1c3RlclN0b3JhZ2VUeXBlLkFVUk9SQSxcbiAgICAgICAgICAgIHZwYzogY2x1c3Rlci52cGMsXG4gICAgICAgICAgICB3cml0ZXI6IENsdXN0ZXJJbnN0YW5jZS5wcm92aXNpb25lZCgnd3JpdGVyJyksXG4gICAgICAgICAgICByZWFkZXJzOiBbQ2x1c3Rlckluc3RhbmNlLnByb3Zpc2lvbmVkKCdyZWFkZXInKV0sXG4gICAgICAgICAgICBkZWxldGlvblByb3RlY3Rpb246IHRydWUsXG4gICAgICAgICAgICBzdG9yYWdlRW5jcnlwdGVkOiB0cnVlLFxuICAgICAgICAgICAgc2VjdXJpdHlHcm91cHM6IFtyZHNTZWN1cml0eUdyb3VwXSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgcmRzQ2x1c3RlckwxQ29uc3RydWN0ID0gcmRzQ2x1c3Rlci5ub2RlLmRlZmF1bHRDaGlsZCBhcyBDZm5EQkNsdXN0ZXI7XG4gICAgICAgIHJkc0NsdXN0ZXJMMUNvbnN0cnVjdC5hZGRQcm9wZXJ0eU92ZXJyaWRlKCdNYW5hZ2VNYXN0ZXJVc2VyUGFzc3dvcmQnLCB0cnVlKTtcbiAgICAgICAgcmRzQ2x1c3RlckwxQ29uc3RydWN0LmFkZFByb3BlcnR5T3ZlcnJpZGUoJ01hc3RlclVzZXJuYW1lJywgJ2FkbWluJyk7XG4gICAgICAgIHJkc0NsdXN0ZXJMMUNvbnN0cnVjdC5hZGRQcm9wZXJ0eURlbGV0aW9uT3ZlcnJpZGUoJ01hc3RlclVzZXJQYXNzd29yZCcpO1xuICAgIH1cbn1cbiJdfQ==