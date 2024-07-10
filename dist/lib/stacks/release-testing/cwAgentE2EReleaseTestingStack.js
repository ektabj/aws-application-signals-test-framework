"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CWAgentE2EReleaseTestingStack = void 0;
const pipelines_1 = require("@amzn/pipelines");
const aws_eks_1 = require("aws-cdk-lib/aws-eks");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const aws_ec2_1 = require("aws-cdk-lib/aws-ec2");
const aws_rds_1 = require("aws-cdk-lib/aws-rds");
/*
This stack is for creating an EKS Cluster for release testing in the following repo:
https://github.com/aws/amazon-cloudwatch-agent
*/
class CWAgentE2EReleaseTestingStack extends pipelines_1.DeploymentStack {
    constructor(parent, name, props) {
        var _a;
        super(parent, name, {
            ...props,
            softwareType: pipelines_1.SoftwareType.INFRASTRUCTURE,
        });
        // Allow the aws/amazon-cloudwatch-agent repo to assume role with the IAM role
        const conditions = {
            StringLike: {
                ['token.actions.githubusercontent.com:sub']: 'repo:aws/amazon-cloudwatch-agent:ref:refs/heads/*',
            },
        };
        // Create an IAM Role with an existing OIDC Identity Provider created in ../e2eTestCommonStack.ts
        const role = new aws_iam_1.Role(this, 'CW-Agent-E2E-Github-Provider-Role', {
            assumedBy: new aws_iam_1.WebIdentityPrincipal('arn:aws:iam::654654176582:oidc-provider/token.actions.githubusercontent.com', conditions),
            managedPolicies: [aws_iam_1.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')],
            roleName: 'CW-Agent-E2E-Github-Provider-Role',
        });
        // This allows developers to access the EKS cluster manually on the terminal
        (_a = role.assumeRolePolicy) === null || _a === void 0 ? void 0 : _a.addStatements(new aws_iam_1.PolicyStatement({
            actions: ['sts:AssumeRole'],
            principals: [new aws_iam_1.AccountRootPrincipal()],
        }));
        // Create an EKS cluster with a load balancer that will run the E2E tests
        const cluster = new aws_eks_1.Cluster(this, `e2e-cw-agent-test`, {
            version: aws_eks_1.KubernetesVersion.V1_27,
            clusterName: `e2e-cw-agent-test`,
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
        const rdsCluster = new aws_rds_1.DatabaseCluster(this, 'RdsAuroraCWAgentE2EClusterForMySQL', {
            engine: aws_rds_1.DatabaseClusterEngine.auroraMysql({ version: aws_rds_1.AuroraMysqlEngineVersion.VER_3_04_1 }),
            clusterIdentifier: 'RdsAuroraCWAgentE2EClusterForMySQL',
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
exports.CWAgentE2EReleaseTestingStack = CWAgentE2EReleaseTestingStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3dBZ2VudEUyRVJlbGVhc2VUZXN0aW5nU3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9saWIvc3RhY2tzL3JlbGVhc2UtdGVzdGluZy9jd0FnZW50RTJFUmVsZWFzZVRlc3RpbmdTdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSwrQ0FBZ0U7QUFDaEUsaURBQWtIO0FBQ2xILGlEQU82QjtBQUU3QixpREFBZ0U7QUFDaEUsaURBTzZCO0FBRTdCOzs7RUFHRTtBQUNGLE1BQWEsNkJBQThCLFNBQVEsMkJBQWU7SUFDOUQsWUFBWSxNQUFXLEVBQUUsSUFBWSxFQUFFLEtBQWlCOztRQUNwRCxLQUFLLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRTtZQUNoQixHQUFHLEtBQUs7WUFDUixZQUFZLEVBQUUsd0JBQVksQ0FBQyxjQUFjO1NBQzVDLENBQUMsQ0FBQztRQUVILDhFQUE4RTtRQUM5RSxNQUFNLFVBQVUsR0FBZTtZQUMzQixVQUFVLEVBQUU7Z0JBQ1IsQ0FBQyx5Q0FBeUMsQ0FBQyxFQUFFLG1EQUFtRDthQUNuRztTQUNKLENBQUM7UUFFRixpR0FBaUc7UUFDakcsTUFBTSxJQUFJLEdBQUcsSUFBSSxjQUFJLENBQUMsSUFBSSxFQUFFLG1DQUFtQyxFQUFFO1lBQzdELFNBQVMsRUFBRSxJQUFJLDhCQUFvQixDQUMvQiw2RUFBNkUsRUFDN0UsVUFBVSxDQUNiO1lBQ0QsZUFBZSxFQUFFLENBQUMsdUJBQWEsQ0FBQyx3QkFBd0IsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1lBQ2hGLFFBQVEsRUFBRSxtQ0FBbUM7U0FDaEQsQ0FBQyxDQUFDO1FBRUgsNEVBQTRFO1FBQzVFLE1BQUEsSUFBSSxDQUFDLGdCQUFnQiwwQ0FBRSxhQUFhLENBQ2hDLElBQUkseUJBQWUsQ0FBQztZQUNoQixPQUFPLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQztZQUMzQixVQUFVLEVBQUUsQ0FBQyxJQUFJLDhCQUFvQixFQUFFLENBQUM7U0FDM0MsQ0FBQyxDQUNMLENBQUM7UUFFRix5RUFBeUU7UUFDekUsTUFBTSxPQUFPLEdBQUcsSUFBSSxpQkFBTyxDQUFDLElBQUksRUFBRSxtQkFBbUIsRUFBRTtZQUNuRCxPQUFPLEVBQUUsMkJBQWlCLENBQUMsS0FBSztZQUNoQyxXQUFXLEVBQUUsbUJBQW1CO1lBQ2hDLGFBQWEsRUFBRSxFQUFFLE9BQU8sRUFBRSw4QkFBb0IsQ0FBQyxNQUFNLEVBQUU7WUFDdkQsV0FBVyxFQUFFLElBQUk7U0FDcEIsQ0FBQyxDQUFDO1FBRUgsSUFBSSxtQ0FBeUIsQ0FBQyxJQUFJLEVBQUUsa0NBQWtDLEVBQUU7WUFDcEUsV0FBVyxFQUFFLE9BQU8sQ0FBQyxXQUFXO1lBQ2hDLElBQUksRUFBRSxNQUFNO1lBQ1osSUFBSSxFQUFFO2dCQUNGLFFBQVEsRUFBRSxtQkFBbUI7Z0JBQzdCLFNBQVMsRUFBRSw2Q0FBNkM7YUFDM0Q7U0FDSixDQUFDLENBQUM7UUFFSCxNQUFNLGdCQUFnQixHQUFHLElBQUksdUJBQWEsQ0FBQyxJQUFJLEVBQUUsa0JBQWtCLEVBQUU7WUFDakUsR0FBRyxFQUFFLE9BQU8sQ0FBQyxHQUFHO1lBQ2hCLFdBQVcsRUFBRSx1Q0FBdUM7WUFDcEQsZ0JBQWdCLEVBQUUsSUFBSTtTQUN6QixDQUFDLENBQUM7UUFFSCwyREFBMkQ7UUFDM0QsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLGNBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxjQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLGtDQUFrQyxDQUFDLENBQUM7UUFFcEcsTUFBTSxVQUFVLEdBQUcsSUFBSSx5QkFBZSxDQUFDLElBQUksRUFBRSxvQ0FBb0MsRUFBRTtZQUMvRSxNQUFNLEVBQUUsK0JBQXFCLENBQUMsV0FBVyxDQUFDLEVBQUUsT0FBTyxFQUFFLGtDQUF3QixDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQzNGLGlCQUFpQixFQUFFLG9DQUFvQztZQUN2RCxXQUFXLEVBQUUsOEJBQW9CLENBQUMsTUFBTTtZQUN4QyxHQUFHLEVBQUUsT0FBTyxDQUFDLEdBQUc7WUFDaEIsTUFBTSxFQUFFLHlCQUFlLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQztZQUM3QyxPQUFPLEVBQUUsQ0FBQyx5QkFBZSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNoRCxrQkFBa0IsRUFBRSxJQUFJO1lBQ3hCLGdCQUFnQixFQUFFLElBQUk7WUFDdEIsY0FBYyxFQUFFLENBQUMsZ0JBQWdCLENBQUM7U0FDckMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxxQkFBcUIsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLFlBQTRCLENBQUM7UUFDM0UscUJBQXFCLENBQUMsbUJBQW1CLENBQUMsMEJBQTBCLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDNUUscUJBQXFCLENBQUMsbUJBQW1CLENBQUMsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDckUscUJBQXFCLENBQUMsMkJBQTJCLENBQUMsb0JBQW9CLENBQUMsQ0FBQztJQUM1RSxDQUFDO0NBQ0o7QUEzRUQsc0VBMkVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwIH0gZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgRGVwbG95bWVudFN0YWNrLCBTb2Z0d2FyZVR5cGUgfSBmcm9tICdAYW16bi9waXBlbGluZXMnO1xuaW1wb3J0IHsgQ2x1c3RlciwgS3ViZXJuZXRlc1ZlcnNpb24sIEFsYkNvbnRyb2xsZXJWZXJzaW9uLCBDZm5JZGVudGl0eVByb3ZpZGVyQ29uZmlnIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWVrcyc7XG5pbXBvcnQge1xuICAgIFJvbGUsXG4gICAgV2ViSWRlbnRpdHlQcmluY2lwYWwsXG4gICAgTWFuYWdlZFBvbGljeSxcbiAgICBDb25kaXRpb25zLFxuICAgIEFjY291bnRSb290UHJpbmNpcGFsLFxuICAgIFBvbGljeVN0YXRlbWVudCxcbn0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWlhbSc7XG5pbXBvcnQgeyBTdGFja1Byb3BzIH0gZnJvbSAnLi4vLi4vdXRpbHMvY29tbW9uJztcbmltcG9ydCB7IFBlZXIsIFBvcnQsIFNlY3VyaXR5R3JvdXAgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWMyJztcbmltcG9ydCB7XG4gICAgRGF0YWJhc2VDbHVzdGVyLFxuICAgIERhdGFiYXNlQ2x1c3RlckVuZ2luZSxcbiAgICBBdXJvcmFNeXNxbEVuZ2luZVZlcnNpb24sXG4gICAgREJDbHVzdGVyU3RvcmFnZVR5cGUsXG4gICAgQ2x1c3Rlckluc3RhbmNlLFxuICAgIENmbkRCQ2x1c3Rlcixcbn0gZnJvbSAnYXdzLWNkay1saWIvYXdzLXJkcyc7XG5cbi8qXG5UaGlzIHN0YWNrIGlzIGZvciBjcmVhdGluZyBhbiBFS1MgQ2x1c3RlciBmb3IgcmVsZWFzZSB0ZXN0aW5nIGluIHRoZSBmb2xsb3dpbmcgcmVwbzpcbmh0dHBzOi8vZ2l0aHViLmNvbS9hd3MvYW1hem9uLWNsb3Vkd2F0Y2gtYWdlbnRcbiovXG5leHBvcnQgY2xhc3MgQ1dBZ2VudEUyRVJlbGVhc2VUZXN0aW5nU3RhY2sgZXh0ZW5kcyBEZXBsb3ltZW50U3RhY2sge1xuICAgIGNvbnN0cnVjdG9yKHBhcmVudDogQXBwLCBuYW1lOiBzdHJpbmcsIHByb3BzOiBTdGFja1Byb3BzKSB7XG4gICAgICAgIHN1cGVyKHBhcmVudCwgbmFtZSwge1xuICAgICAgICAgICAgLi4ucHJvcHMsXG4gICAgICAgICAgICBzb2Z0d2FyZVR5cGU6IFNvZnR3YXJlVHlwZS5JTkZSQVNUUlVDVFVSRSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQWxsb3cgdGhlIGF3cy9hbWF6b24tY2xvdWR3YXRjaC1hZ2VudCByZXBvIHRvIGFzc3VtZSByb2xlIHdpdGggdGhlIElBTSByb2xlXG4gICAgICAgIGNvbnN0IGNvbmRpdGlvbnM6IENvbmRpdGlvbnMgPSB7XG4gICAgICAgICAgICBTdHJpbmdMaWtlOiB7XG4gICAgICAgICAgICAgICAgWyd0b2tlbi5hY3Rpb25zLmdpdGh1YnVzZXJjb250ZW50LmNvbTpzdWInXTogJ3JlcG86YXdzL2FtYXpvbi1jbG91ZHdhdGNoLWFnZW50OnJlZjpyZWZzL2hlYWRzLyonLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBDcmVhdGUgYW4gSUFNIFJvbGUgd2l0aCBhbiBleGlzdGluZyBPSURDIElkZW50aXR5IFByb3ZpZGVyIGNyZWF0ZWQgaW4gLi4vZTJlVGVzdENvbW1vblN0YWNrLnRzXG4gICAgICAgIGNvbnN0IHJvbGUgPSBuZXcgUm9sZSh0aGlzLCAnQ1ctQWdlbnQtRTJFLUdpdGh1Yi1Qcm92aWRlci1Sb2xlJywge1xuICAgICAgICAgICAgYXNzdW1lZEJ5OiBuZXcgV2ViSWRlbnRpdHlQcmluY2lwYWwoXG4gICAgICAgICAgICAgICAgJ2Fybjphd3M6aWFtOjo2NTQ2NTQxNzY1ODI6b2lkYy1wcm92aWRlci90b2tlbi5hY3Rpb25zLmdpdGh1YnVzZXJjb250ZW50LmNvbScsXG4gICAgICAgICAgICAgICAgY29uZGl0aW9ucyxcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBtYW5hZ2VkUG9saWNpZXM6IFtNYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZSgnQWRtaW5pc3RyYXRvckFjY2VzcycpXSxcbiAgICAgICAgICAgIHJvbGVOYW1lOiAnQ1ctQWdlbnQtRTJFLUdpdGh1Yi1Qcm92aWRlci1Sb2xlJyxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gVGhpcyBhbGxvd3MgZGV2ZWxvcGVycyB0byBhY2Nlc3MgdGhlIEVLUyBjbHVzdGVyIG1hbnVhbGx5IG9uIHRoZSB0ZXJtaW5hbFxuICAgICAgICByb2xlLmFzc3VtZVJvbGVQb2xpY3k/LmFkZFN0YXRlbWVudHMoXG4gICAgICAgICAgICBuZXcgUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICAgICAgICBhY3Rpb25zOiBbJ3N0czpBc3N1bWVSb2xlJ10sXG4gICAgICAgICAgICAgICAgcHJpbmNpcGFsczogW25ldyBBY2NvdW50Um9vdFByaW5jaXBhbCgpXSxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICApO1xuXG4gICAgICAgIC8vIENyZWF0ZSBhbiBFS1MgY2x1c3RlciB3aXRoIGEgbG9hZCBiYWxhbmNlciB0aGF0IHdpbGwgcnVuIHRoZSBFMkUgdGVzdHNcbiAgICAgICAgY29uc3QgY2x1c3RlciA9IG5ldyBDbHVzdGVyKHRoaXMsIGBlMmUtY3ctYWdlbnQtdGVzdGAsIHtcbiAgICAgICAgICAgIHZlcnNpb246IEt1YmVybmV0ZXNWZXJzaW9uLlYxXzI3LFxuICAgICAgICAgICAgY2x1c3Rlck5hbWU6IGBlMmUtY3ctYWdlbnQtdGVzdGAsXG4gICAgICAgICAgICBhbGJDb250cm9sbGVyOiB7IHZlcnNpb246IEFsYkNvbnRyb2xsZXJWZXJzaW9uLlYyXzRfNyB9LFxuICAgICAgICAgICAgbWFzdGVyc1JvbGU6IHJvbGUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIG5ldyBDZm5JZGVudGl0eVByb3ZpZGVyQ29uZmlnKHRoaXMsIGBhZG90LW9pZGMtcHJvdmlkZXItY29uZmlndXJhdGlvbmAsIHtcbiAgICAgICAgICAgIGNsdXN0ZXJOYW1lOiBjbHVzdGVyLmNsdXN0ZXJOYW1lLFxuICAgICAgICAgICAgdHlwZTogJ29pZGMnLFxuICAgICAgICAgICAgb2lkYzoge1xuICAgICAgICAgICAgICAgIGNsaWVudElkOiAnc3RzLmFtYXpvbmF3cy5jb20nLFxuICAgICAgICAgICAgICAgIGlzc3VlclVybDogJ2h0dHBzOi8vdG9rZW4uYWN0aW9ucy5naXRodWJ1c2VyY29udGVudC5jb20nLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgcmRzU2VjdXJpdHlHcm91cCA9IG5ldyBTZWN1cml0eUdyb3VwKHRoaXMsICdSZHNTZWN1cml0eUdyb3VwJywge1xuICAgICAgICAgICAgdnBjOiBjbHVzdGVyLnZwYyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnU2VjdXJpdHkgZ3JvdXAgZm9yIFJEUyBBdXJvcmEgY2x1c3RlcicsXG4gICAgICAgICAgICBhbGxvd0FsbE91dGJvdW5kOiB0cnVlLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBBZGQgaW5ncmVzcyBydWxlIHRvIGFsbG93IGFjY2VzcyBmcm9tIGFsbCBJUHY0IGFkZHJlc3Nlc1xuICAgICAgICByZHNTZWN1cml0eUdyb3VwLmFkZEluZ3Jlc3NSdWxlKFBlZXIuYW55SXB2NCgpLCBQb3J0LnRjcCgzMzA2KSwgJ0FsbG93IE15U1FMIGFjY2VzcyBmcm9tIGFsbCBJUHY0Jyk7XG5cbiAgICAgICAgY29uc3QgcmRzQ2x1c3RlciA9IG5ldyBEYXRhYmFzZUNsdXN0ZXIodGhpcywgJ1Jkc0F1cm9yYUNXQWdlbnRFMkVDbHVzdGVyRm9yTXlTUUwnLCB7XG4gICAgICAgICAgICBlbmdpbmU6IERhdGFiYXNlQ2x1c3RlckVuZ2luZS5hdXJvcmFNeXNxbCh7IHZlcnNpb246IEF1cm9yYU15c3FsRW5naW5lVmVyc2lvbi5WRVJfM18wNF8xIH0pLFxuICAgICAgICAgICAgY2x1c3RlcklkZW50aWZpZXI6ICdSZHNBdXJvcmFDV0FnZW50RTJFQ2x1c3RlckZvck15U1FMJyxcbiAgICAgICAgICAgIHN0b3JhZ2VUeXBlOiBEQkNsdXN0ZXJTdG9yYWdlVHlwZS5BVVJPUkEsXG4gICAgICAgICAgICB2cGM6IGNsdXN0ZXIudnBjLFxuICAgICAgICAgICAgd3JpdGVyOiBDbHVzdGVySW5zdGFuY2UucHJvdmlzaW9uZWQoJ3dyaXRlcicpLFxuICAgICAgICAgICAgcmVhZGVyczogW0NsdXN0ZXJJbnN0YW5jZS5wcm92aXNpb25lZCgncmVhZGVyJyldLFxuICAgICAgICAgICAgZGVsZXRpb25Qcm90ZWN0aW9uOiB0cnVlLFxuICAgICAgICAgICAgc3RvcmFnZUVuY3J5cHRlZDogdHJ1ZSxcbiAgICAgICAgICAgIHNlY3VyaXR5R3JvdXBzOiBbcmRzU2VjdXJpdHlHcm91cF0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHJkc0NsdXN0ZXJMMUNvbnN0cnVjdCA9IHJkc0NsdXN0ZXIubm9kZS5kZWZhdWx0Q2hpbGQgYXMgQ2ZuREJDbHVzdGVyO1xuICAgICAgICByZHNDbHVzdGVyTDFDb25zdHJ1Y3QuYWRkUHJvcGVydHlPdmVycmlkZSgnTWFuYWdlTWFzdGVyVXNlclBhc3N3b3JkJywgdHJ1ZSk7XG4gICAgICAgIHJkc0NsdXN0ZXJMMUNvbnN0cnVjdC5hZGRQcm9wZXJ0eU92ZXJyaWRlKCdNYXN0ZXJVc2VybmFtZScsICdhZG1pbicpO1xuICAgICAgICByZHNDbHVzdGVyTDFDb25zdHJ1Y3QuYWRkUHJvcGVydHlEZWxldGlvbk92ZXJyaWRlKCdNYXN0ZXJVc2VyUGFzc3dvcmQnKTtcbiAgICB9XG59XG4iXX0=