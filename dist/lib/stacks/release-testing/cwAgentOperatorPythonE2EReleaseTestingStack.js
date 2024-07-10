"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CWAgentOperatorPythonE2EReleaseTestingStack = void 0;
const pipelines_1 = require("@amzn/pipelines");
const aws_eks_1 = require("aws-cdk-lib/aws-eks");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const aws_ec2_1 = require("aws-cdk-lib/aws-ec2");
const aws_rds_1 = require("aws-cdk-lib/aws-rds");
/*
This stack is for creating an EKS Cluster for release testing in the following repo:
https://github.com/aws/amazon-cloudwatch-agent-operator
*/
class CWAgentOperatorPythonE2EReleaseTestingStack extends pipelines_1.DeploymentStack {
    constructor(parent, name, props) {
        super(parent, name, {
            ...props,
            softwareType: pipelines_1.SoftwareType.INFRASTRUCTURE,
        });
        // Retrieve the role that the github repository will be assuming to access the EKS cluster
        const role = aws_iam_1.Role.fromRoleName(this, 'CW-Agent-Operator-E2E-Github-Provider-Role', 'CW-Agent-Operator-E2E-Github-Provider-Role');
        // Create an EKS cluster with a load balancer that will run the E2E tests
        const cluster = new aws_eks_1.Cluster(this, `e2e-cw-agent-operator-python-test`, {
            version: aws_eks_1.KubernetesVersion.V1_27,
            clusterName: `e2e-cw-agent-operator-python-test`,
            albController: { version: aws_eks_1.AlbControllerVersion.V2_4_7 },
            mastersRole: role,
        });
        // Add OIDC provider config to the cluster
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
        const rdsCluster = new aws_rds_1.DatabaseCluster(this, 'RdsAuroraCWAgentOperatorPythonE2EClusterForMySQL', {
            engine: aws_rds_1.DatabaseClusterEngine.auroraMysql({ version: aws_rds_1.AuroraMysqlEngineVersion.VER_3_04_1 }),
            clusterIdentifier: 'RdsAuroraCWAgentOperatorPythonE2EClusterForMySQL',
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
exports.CWAgentOperatorPythonE2EReleaseTestingStack = CWAgentOperatorPythonE2EReleaseTestingStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3dBZ2VudE9wZXJhdG9yUHl0aG9uRTJFUmVsZWFzZVRlc3RpbmdTdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYi9zdGFja3MvcmVsZWFzZS10ZXN0aW5nL2N3QWdlbnRPcGVyYXRvclB5dGhvbkUyRVJlbGVhc2VUZXN0aW5nU3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsK0NBQWdFO0FBQ2hFLGlEQUFrSDtBQUNsSCxpREFBMkM7QUFFM0MsaURBQWdFO0FBQ2hFLGlEQU82QjtBQUU3Qjs7O0VBR0U7QUFDRixNQUFhLDJDQUE0QyxTQUFRLDJCQUFlO0lBQzVFLFlBQVksTUFBVyxFQUFFLElBQVksRUFBRSxLQUFpQjtRQUNwRCxLQUFLLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRTtZQUNoQixHQUFHLEtBQUs7WUFDUixZQUFZLEVBQUUsd0JBQVksQ0FBQyxjQUFjO1NBQzVDLENBQUMsQ0FBQztRQUVILDBGQUEwRjtRQUMxRixNQUFNLElBQUksR0FBRyxjQUFJLENBQUMsWUFBWSxDQUMxQixJQUFJLEVBQ0osNENBQTRDLEVBQzVDLDRDQUE0QyxDQUMvQyxDQUFDO1FBRUYseUVBQXlFO1FBQ3pFLE1BQU0sT0FBTyxHQUFHLElBQUksaUJBQU8sQ0FBQyxJQUFJLEVBQUUsbUNBQW1DLEVBQUU7WUFDbkUsT0FBTyxFQUFFLDJCQUFpQixDQUFDLEtBQUs7WUFDaEMsV0FBVyxFQUFFLG1DQUFtQztZQUNoRCxhQUFhLEVBQUUsRUFBRSxPQUFPLEVBQUUsOEJBQW9CLENBQUMsTUFBTSxFQUFFO1lBQ3ZELFdBQVcsRUFBRSxJQUFJO1NBQ3BCLENBQUMsQ0FBQztRQUVILDBDQUEwQztRQUMxQyxJQUFJLG1DQUF5QixDQUFDLElBQUksRUFBRSxrQ0FBa0MsRUFBRTtZQUNwRSxXQUFXLEVBQUUsT0FBTyxDQUFDLFdBQVc7WUFDaEMsSUFBSSxFQUFFLE1BQU07WUFDWixJQUFJLEVBQUU7Z0JBQ0YsUUFBUSxFQUFFLG1CQUFtQjtnQkFDN0IsU0FBUyxFQUFFLDZDQUE2QzthQUMzRDtTQUNKLENBQUMsQ0FBQztRQUVILE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSx1QkFBYSxDQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRTtZQUNqRSxHQUFHLEVBQUUsT0FBTyxDQUFDLEdBQUc7WUFDaEIsV0FBVyxFQUFFLHVDQUF1QztZQUNwRCxnQkFBZ0IsRUFBRSxJQUFJO1NBQ3pCLENBQUMsQ0FBQztRQUVILDJEQUEyRDtRQUMzRCxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsY0FBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLGNBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsa0NBQWtDLENBQUMsQ0FBQztRQUVwRyxNQUFNLFVBQVUsR0FBRyxJQUFJLHlCQUFlLENBQUMsSUFBSSxFQUFFLGtEQUFrRCxFQUFFO1lBQzdGLE1BQU0sRUFBRSwrQkFBcUIsQ0FBQyxXQUFXLENBQUMsRUFBRSxPQUFPLEVBQUUsa0NBQXdCLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDM0YsaUJBQWlCLEVBQUUsa0RBQWtEO1lBQ3JFLFdBQVcsRUFBRSw4QkFBb0IsQ0FBQyxNQUFNO1lBQ3hDLEdBQUcsRUFBRSxPQUFPLENBQUMsR0FBRztZQUNoQixNQUFNLEVBQUUseUJBQWUsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO1lBQzdDLE9BQU8sRUFBRSxDQUFDLHlCQUFlLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2hELGtCQUFrQixFQUFFLElBQUk7WUFDeEIsZ0JBQWdCLEVBQUUsSUFBSTtZQUN0QixjQUFjLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQztTQUNyQyxDQUFDLENBQUM7UUFFSCxNQUFNLHFCQUFxQixHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsWUFBNEIsQ0FBQztRQUMzRSxxQkFBcUIsQ0FBQyxtQkFBbUIsQ0FBQywwQkFBMEIsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM1RSxxQkFBcUIsQ0FBQyxtQkFBbUIsQ0FBQyxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNyRSxxQkFBcUIsQ0FBQywyQkFBMkIsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0lBQzVFLENBQUM7Q0FDSjtBQTFERCxrR0EwREMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHAgfSBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBEZXBsb3ltZW50U3RhY2ssIFNvZnR3YXJlVHlwZSB9IGZyb20gJ0BhbXpuL3BpcGVsaW5lcyc7XG5pbXBvcnQgeyBDbHVzdGVyLCBLdWJlcm5ldGVzVmVyc2lvbiwgQWxiQ29udHJvbGxlclZlcnNpb24sIENmbklkZW50aXR5UHJvdmlkZXJDb25maWcgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWtzJztcbmltcG9ydCB7IFJvbGUgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcbmltcG9ydCB7IFN0YWNrUHJvcHMgfSBmcm9tICcuLi8uLi91dGlscy9jb21tb24nO1xuaW1wb3J0IHsgUGVlciwgUG9ydCwgU2VjdXJpdHlHcm91cCB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1lYzInO1xuaW1wb3J0IHtcbiAgICBEYXRhYmFzZUNsdXN0ZXIsXG4gICAgRGF0YWJhc2VDbHVzdGVyRW5naW5lLFxuICAgIEF1cm9yYU15c3FsRW5naW5lVmVyc2lvbixcbiAgICBEQkNsdXN0ZXJTdG9yYWdlVHlwZSxcbiAgICBDbHVzdGVySW5zdGFuY2UsXG4gICAgQ2ZuREJDbHVzdGVyLFxufSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtcmRzJztcblxuLypcblRoaXMgc3RhY2sgaXMgZm9yIGNyZWF0aW5nIGFuIEVLUyBDbHVzdGVyIGZvciByZWxlYXNlIHRlc3RpbmcgaW4gdGhlIGZvbGxvd2luZyByZXBvOlxuaHR0cHM6Ly9naXRodWIuY29tL2F3cy9hbWF6b24tY2xvdWR3YXRjaC1hZ2VudC1vcGVyYXRvclxuKi9cbmV4cG9ydCBjbGFzcyBDV0FnZW50T3BlcmF0b3JQeXRob25FMkVSZWxlYXNlVGVzdGluZ1N0YWNrIGV4dGVuZHMgRGVwbG95bWVudFN0YWNrIHtcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQ6IEFwcCwgbmFtZTogc3RyaW5nLCBwcm9wczogU3RhY2tQcm9wcykge1xuICAgICAgICBzdXBlcihwYXJlbnQsIG5hbWUsIHtcbiAgICAgICAgICAgIC4uLnByb3BzLFxuICAgICAgICAgICAgc29mdHdhcmVUeXBlOiBTb2Z0d2FyZVR5cGUuSU5GUkFTVFJVQ1RVUkUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFJldHJpZXZlIHRoZSByb2xlIHRoYXQgdGhlIGdpdGh1YiByZXBvc2l0b3J5IHdpbGwgYmUgYXNzdW1pbmcgdG8gYWNjZXNzIHRoZSBFS1MgY2x1c3RlclxuICAgICAgICBjb25zdCByb2xlID0gUm9sZS5mcm9tUm9sZU5hbWUoXG4gICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAgJ0NXLUFnZW50LU9wZXJhdG9yLUUyRS1HaXRodWItUHJvdmlkZXItUm9sZScsXG4gICAgICAgICAgICAnQ1ctQWdlbnQtT3BlcmF0b3ItRTJFLUdpdGh1Yi1Qcm92aWRlci1Sb2xlJyxcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBDcmVhdGUgYW4gRUtTIGNsdXN0ZXIgd2l0aCBhIGxvYWQgYmFsYW5jZXIgdGhhdCB3aWxsIHJ1biB0aGUgRTJFIHRlc3RzXG4gICAgICAgIGNvbnN0IGNsdXN0ZXIgPSBuZXcgQ2x1c3Rlcih0aGlzLCBgZTJlLWN3LWFnZW50LW9wZXJhdG9yLXB5dGhvbi10ZXN0YCwge1xuICAgICAgICAgICAgdmVyc2lvbjogS3ViZXJuZXRlc1ZlcnNpb24uVjFfMjcsXG4gICAgICAgICAgICBjbHVzdGVyTmFtZTogYGUyZS1jdy1hZ2VudC1vcGVyYXRvci1weXRob24tdGVzdGAsXG4gICAgICAgICAgICBhbGJDb250cm9sbGVyOiB7IHZlcnNpb246IEFsYkNvbnRyb2xsZXJWZXJzaW9uLlYyXzRfNyB9LFxuICAgICAgICAgICAgbWFzdGVyc1JvbGU6IHJvbGUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEFkZCBPSURDIHByb3ZpZGVyIGNvbmZpZyB0byB0aGUgY2x1c3RlclxuICAgICAgICBuZXcgQ2ZuSWRlbnRpdHlQcm92aWRlckNvbmZpZyh0aGlzLCBgYWRvdC1vaWRjLXByb3ZpZGVyLWNvbmZpZ3VyYXRpb25gLCB7XG4gICAgICAgICAgICBjbHVzdGVyTmFtZTogY2x1c3Rlci5jbHVzdGVyTmFtZSxcbiAgICAgICAgICAgIHR5cGU6ICdvaWRjJyxcbiAgICAgICAgICAgIG9pZGM6IHtcbiAgICAgICAgICAgICAgICBjbGllbnRJZDogJ3N0cy5hbWF6b25hd3MuY29tJyxcbiAgICAgICAgICAgICAgICBpc3N1ZXJVcmw6ICdodHRwczovL3Rva2VuLmFjdGlvbnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHJkc1NlY3VyaXR5R3JvdXAgPSBuZXcgU2VjdXJpdHlHcm91cCh0aGlzLCAnUmRzU2VjdXJpdHlHcm91cCcsIHtcbiAgICAgICAgICAgIHZwYzogY2x1c3Rlci52cGMsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1NlY3VyaXR5IGdyb3VwIGZvciBSRFMgQXVyb3JhIGNsdXN0ZXInLFxuICAgICAgICAgICAgYWxsb3dBbGxPdXRib3VuZDogdHJ1ZSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQWRkIGluZ3Jlc3MgcnVsZSB0byBhbGxvdyBhY2Nlc3MgZnJvbSBhbGwgSVB2NCBhZGRyZXNzZXNcbiAgICAgICAgcmRzU2VjdXJpdHlHcm91cC5hZGRJbmdyZXNzUnVsZShQZWVyLmFueUlwdjQoKSwgUG9ydC50Y3AoMzMwNiksICdBbGxvdyBNeVNRTCBhY2Nlc3MgZnJvbSBhbGwgSVB2NCcpO1xuXG4gICAgICAgIGNvbnN0IHJkc0NsdXN0ZXIgPSBuZXcgRGF0YWJhc2VDbHVzdGVyKHRoaXMsICdSZHNBdXJvcmFDV0FnZW50T3BlcmF0b3JQeXRob25FMkVDbHVzdGVyRm9yTXlTUUwnLCB7XG4gICAgICAgICAgICBlbmdpbmU6IERhdGFiYXNlQ2x1c3RlckVuZ2luZS5hdXJvcmFNeXNxbCh7IHZlcnNpb246IEF1cm9yYU15c3FsRW5naW5lVmVyc2lvbi5WRVJfM18wNF8xIH0pLFxuICAgICAgICAgICAgY2x1c3RlcklkZW50aWZpZXI6ICdSZHNBdXJvcmFDV0FnZW50T3BlcmF0b3JQeXRob25FMkVDbHVzdGVyRm9yTXlTUUwnLFxuICAgICAgICAgICAgc3RvcmFnZVR5cGU6IERCQ2x1c3RlclN0b3JhZ2VUeXBlLkFVUk9SQSxcbiAgICAgICAgICAgIHZwYzogY2x1c3Rlci52cGMsXG4gICAgICAgICAgICB3cml0ZXI6IENsdXN0ZXJJbnN0YW5jZS5wcm92aXNpb25lZCgnd3JpdGVyJyksXG4gICAgICAgICAgICByZWFkZXJzOiBbQ2x1c3Rlckluc3RhbmNlLnByb3Zpc2lvbmVkKCdyZWFkZXInKV0sXG4gICAgICAgICAgICBkZWxldGlvblByb3RlY3Rpb246IHRydWUsXG4gICAgICAgICAgICBzdG9yYWdlRW5jcnlwdGVkOiB0cnVlLFxuICAgICAgICAgICAgc2VjdXJpdHlHcm91cHM6IFtyZHNTZWN1cml0eUdyb3VwXSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgcmRzQ2x1c3RlckwxQ29uc3RydWN0ID0gcmRzQ2x1c3Rlci5ub2RlLmRlZmF1bHRDaGlsZCBhcyBDZm5EQkNsdXN0ZXI7XG4gICAgICAgIHJkc0NsdXN0ZXJMMUNvbnN0cnVjdC5hZGRQcm9wZXJ0eU92ZXJyaWRlKCdNYW5hZ2VNYXN0ZXJVc2VyUGFzc3dvcmQnLCB0cnVlKTtcbiAgICAgICAgcmRzQ2x1c3RlckwxQ29uc3RydWN0LmFkZFByb3BlcnR5T3ZlcnJpZGUoJ01hc3RlclVzZXJuYW1lJywgJ2FkbWluJyk7XG4gICAgICAgIHJkc0NsdXN0ZXJMMUNvbnN0cnVjdC5hZGRQcm9wZXJ0eURlbGV0aW9uT3ZlcnJpZGUoJ01hc3RlclVzZXJQYXNzd29yZCcpO1xuICAgIH1cbn1cbiJdfQ==