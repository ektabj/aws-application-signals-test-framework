"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdotPythonE2EReleaseTestingStack = void 0;
const pipelines_1 = require("@amzn/pipelines");
const aws_eks_1 = require("aws-cdk-lib/aws-eks");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const aws_ec2_1 = require("aws-cdk-lib/aws-ec2");
const aws_rds_1 = require("aws-cdk-lib/aws-rds");
/*
This stack is for creating an EKS Cluster for release testing in the following repo:
- aws-observability/aws-application-signals-test-framework
- aws-observability/aws-otel-python-instrumentation (temporarily until ADOT Python is public)
*/
class AdotPythonE2EReleaseTestingStack extends pipelines_1.DeploymentStack {
    constructor(parent, name, props) {
        super(parent, name, {
            ...props,
            softwareType: pipelines_1.SoftwareType.INFRASTRUCTURE,
        });
        // Retrieve an IAM Role with an existing OIDC Identity Provider created in ./AdotE2EReleaseTestingStack.ts
        const role = aws_iam_1.Role.fromRoleName(this, 'Adot-E2E-Github-Provider-Role', 'Adot-E2E-Github-Provider-Role');
        // Create an EKS cluster with a load balancer that will run the E2E tests
        const cluster = new aws_eks_1.Cluster(this, `e2e-python-adot-test`, {
            version: aws_eks_1.KubernetesVersion.V1_27,
            clusterName: `e2e-python-adot-test`,
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
        const rdsCluster = new aws_rds_1.DatabaseCluster(this, 'RdsAuroraAdotPythonE2EClusterForMySQL', {
            engine: aws_rds_1.DatabaseClusterEngine.auroraMysql({ version: aws_rds_1.AuroraMysqlEngineVersion.VER_3_04_1 }),
            clusterIdentifier: 'RdsAuroraAdotPythonE2EClusterForMySQL',
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
exports.AdotPythonE2EReleaseTestingStack = AdotPythonE2EReleaseTestingStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRvdFB5dGhvbkUyRVJlbGVhc2VUZXN0aW5nU3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9saWIvc3RhY2tzL3JlbGVhc2UtdGVzdGluZy9hZG90UHl0aG9uRTJFUmVsZWFzZVRlc3RpbmdTdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrQ0FBZ0U7QUFFaEUsaURBQWtIO0FBQ2xILGlEQUEyQztBQUUzQyxpREFBZ0U7QUFDaEUsaURBTzZCO0FBRTdCOzs7O0VBSUU7QUFDRixNQUFhLGdDQUFpQyxTQUFRLDJCQUFlO0lBQ2pFLFlBQVksTUFBVyxFQUFFLElBQVksRUFBRSxLQUFpQjtRQUNwRCxLQUFLLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRTtZQUNoQixHQUFHLEtBQUs7WUFDUixZQUFZLEVBQUUsd0JBQVksQ0FBQyxjQUFjO1NBQzVDLENBQUMsQ0FBQztRQUVILDBHQUEwRztRQUMxRyxNQUFNLElBQUksR0FBRyxjQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSwrQkFBK0IsRUFBRSwrQkFBK0IsQ0FBQyxDQUFDO1FBRXZHLHlFQUF5RTtRQUN6RSxNQUFNLE9BQU8sR0FBRyxJQUFJLGlCQUFPLENBQUMsSUFBSSxFQUFFLHNCQUFzQixFQUFFO1lBQ3RELE9BQU8sRUFBRSwyQkFBaUIsQ0FBQyxLQUFLO1lBQ2hDLFdBQVcsRUFBRSxzQkFBc0I7WUFDbkMsYUFBYSxFQUFFLEVBQUUsT0FBTyxFQUFFLDhCQUFvQixDQUFDLE1BQU0sRUFBRTtZQUN2RCxXQUFXLEVBQUUsSUFBSTtTQUNwQixDQUFDLENBQUM7UUFFSCxJQUFJLG1DQUF5QixDQUFDLElBQUksRUFBRSxrQ0FBa0MsRUFBRTtZQUNwRSxXQUFXLEVBQUUsT0FBTyxDQUFDLFdBQVc7WUFDaEMsSUFBSSxFQUFFLE1BQU07WUFDWixJQUFJLEVBQUU7Z0JBQ0YsUUFBUSxFQUFFLG1CQUFtQjtnQkFDN0IsU0FBUyxFQUFFLDZDQUE2QzthQUMzRDtTQUNKLENBQUMsQ0FBQztRQUVILE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSx1QkFBYSxDQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRTtZQUNqRSxHQUFHLEVBQUUsT0FBTyxDQUFDLEdBQUc7WUFDaEIsV0FBVyxFQUFFLHVDQUF1QztZQUNwRCxnQkFBZ0IsRUFBRSxJQUFJO1NBQ3pCLENBQUMsQ0FBQztRQUVILDJEQUEyRDtRQUMzRCxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsY0FBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLGNBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsa0NBQWtDLENBQUMsQ0FBQztRQUVwRyxNQUFNLFVBQVUsR0FBRyxJQUFJLHlCQUFlLENBQUMsSUFBSSxFQUFFLHVDQUF1QyxFQUFFO1lBQ2xGLE1BQU0sRUFBRSwrQkFBcUIsQ0FBQyxXQUFXLENBQUMsRUFBRSxPQUFPLEVBQUUsa0NBQXdCLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDM0YsaUJBQWlCLEVBQUUsdUNBQXVDO1lBQzFELFdBQVcsRUFBRSw4QkFBb0IsQ0FBQyxNQUFNO1lBQ3hDLEdBQUcsRUFBRSxPQUFPLENBQUMsR0FBRztZQUNoQixNQUFNLEVBQUUseUJBQWUsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO1lBQzdDLE9BQU8sRUFBRSxDQUFDLHlCQUFlLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2hELGtCQUFrQixFQUFFLElBQUk7WUFDeEIsZ0JBQWdCLEVBQUUsSUFBSTtZQUN0QixjQUFjLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQztTQUNyQyxDQUFDLENBQUM7UUFFSCxNQUFNLHFCQUFxQixHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsWUFBNEIsQ0FBQztRQUMzRSxxQkFBcUIsQ0FBQyxtQkFBbUIsQ0FBQywwQkFBMEIsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM1RSxxQkFBcUIsQ0FBQyxtQkFBbUIsQ0FBQyxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNyRSxxQkFBcUIsQ0FBQywyQkFBMkIsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0lBQzVFLENBQUM7Q0FDSjtBQXJERCw0RUFxREMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEZXBsb3ltZW50U3RhY2ssIFNvZnR3YXJlVHlwZSB9IGZyb20gJ0BhbXpuL3BpcGVsaW5lcyc7XG5pbXBvcnQgeyBBcHAgfSBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBBbGJDb250cm9sbGVyVmVyc2lvbiwgQ2ZuSWRlbnRpdHlQcm92aWRlckNvbmZpZywgQ2x1c3RlciwgS3ViZXJuZXRlc1ZlcnNpb24gfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWtzJztcbmltcG9ydCB7IFJvbGUgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcbmltcG9ydCB7IFN0YWNrUHJvcHMgfSBmcm9tICcuLi8uLi91dGlscy9jb21tb24nO1xuaW1wb3J0IHsgUGVlciwgUG9ydCwgU2VjdXJpdHlHcm91cCB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1lYzInO1xuaW1wb3J0IHtcbiAgICBEYXRhYmFzZUNsdXN0ZXIsXG4gICAgRGF0YWJhc2VDbHVzdGVyRW5naW5lLFxuICAgIEF1cm9yYU15c3FsRW5naW5lVmVyc2lvbixcbiAgICBEQkNsdXN0ZXJTdG9yYWdlVHlwZSxcbiAgICBDbHVzdGVySW5zdGFuY2UsXG4gICAgQ2ZuREJDbHVzdGVyLFxufSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtcmRzJztcblxuLypcblRoaXMgc3RhY2sgaXMgZm9yIGNyZWF0aW5nIGFuIEVLUyBDbHVzdGVyIGZvciByZWxlYXNlIHRlc3RpbmcgaW4gdGhlIGZvbGxvd2luZyByZXBvOlxuLSBhd3Mtb2JzZXJ2YWJpbGl0eS9hd3MtYXBwbGljYXRpb24tc2lnbmFscy10ZXN0LWZyYW1ld29ya1xuLSBhd3Mtb2JzZXJ2YWJpbGl0eS9hd3Mtb3RlbC1weXRob24taW5zdHJ1bWVudGF0aW9uICh0ZW1wb3JhcmlseSB1bnRpbCBBRE9UIFB5dGhvbiBpcyBwdWJsaWMpXG4qL1xuZXhwb3J0IGNsYXNzIEFkb3RQeXRob25FMkVSZWxlYXNlVGVzdGluZ1N0YWNrIGV4dGVuZHMgRGVwbG95bWVudFN0YWNrIHtcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQ6IEFwcCwgbmFtZTogc3RyaW5nLCBwcm9wczogU3RhY2tQcm9wcykge1xuICAgICAgICBzdXBlcihwYXJlbnQsIG5hbWUsIHtcbiAgICAgICAgICAgIC4uLnByb3BzLFxuICAgICAgICAgICAgc29mdHdhcmVUeXBlOiBTb2Z0d2FyZVR5cGUuSU5GUkFTVFJVQ1RVUkUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFJldHJpZXZlIGFuIElBTSBSb2xlIHdpdGggYW4gZXhpc3RpbmcgT0lEQyBJZGVudGl0eSBQcm92aWRlciBjcmVhdGVkIGluIC4vQWRvdEUyRVJlbGVhc2VUZXN0aW5nU3RhY2sudHNcbiAgICAgICAgY29uc3Qgcm9sZSA9IFJvbGUuZnJvbVJvbGVOYW1lKHRoaXMsICdBZG90LUUyRS1HaXRodWItUHJvdmlkZXItUm9sZScsICdBZG90LUUyRS1HaXRodWItUHJvdmlkZXItUm9sZScpO1xuXG4gICAgICAgIC8vIENyZWF0ZSBhbiBFS1MgY2x1c3RlciB3aXRoIGEgbG9hZCBiYWxhbmNlciB0aGF0IHdpbGwgcnVuIHRoZSBFMkUgdGVzdHNcbiAgICAgICAgY29uc3QgY2x1c3RlciA9IG5ldyBDbHVzdGVyKHRoaXMsIGBlMmUtcHl0aG9uLWFkb3QtdGVzdGAsIHtcbiAgICAgICAgICAgIHZlcnNpb246IEt1YmVybmV0ZXNWZXJzaW9uLlYxXzI3LFxuICAgICAgICAgICAgY2x1c3Rlck5hbWU6IGBlMmUtcHl0aG9uLWFkb3QtdGVzdGAsXG4gICAgICAgICAgICBhbGJDb250cm9sbGVyOiB7IHZlcnNpb246IEFsYkNvbnRyb2xsZXJWZXJzaW9uLlYyXzRfNyB9LFxuICAgICAgICAgICAgbWFzdGVyc1JvbGU6IHJvbGUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIG5ldyBDZm5JZGVudGl0eVByb3ZpZGVyQ29uZmlnKHRoaXMsIGBhZG90LW9pZGMtcHJvdmlkZXItY29uZmlndXJhdGlvbmAsIHtcbiAgICAgICAgICAgIGNsdXN0ZXJOYW1lOiBjbHVzdGVyLmNsdXN0ZXJOYW1lLFxuICAgICAgICAgICAgdHlwZTogJ29pZGMnLFxuICAgICAgICAgICAgb2lkYzoge1xuICAgICAgICAgICAgICAgIGNsaWVudElkOiAnc3RzLmFtYXpvbmF3cy5jb20nLFxuICAgICAgICAgICAgICAgIGlzc3VlclVybDogJ2h0dHBzOi8vdG9rZW4uYWN0aW9ucy5naXRodWJ1c2VyY29udGVudC5jb20nLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgcmRzU2VjdXJpdHlHcm91cCA9IG5ldyBTZWN1cml0eUdyb3VwKHRoaXMsICdSZHNTZWN1cml0eUdyb3VwJywge1xuICAgICAgICAgICAgdnBjOiBjbHVzdGVyLnZwYyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnU2VjdXJpdHkgZ3JvdXAgZm9yIFJEUyBBdXJvcmEgY2x1c3RlcicsXG4gICAgICAgICAgICBhbGxvd0FsbE91dGJvdW5kOiB0cnVlLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBBZGQgaW5ncmVzcyBydWxlIHRvIGFsbG93IGFjY2VzcyBmcm9tIGFsbCBJUHY0IGFkZHJlc3Nlc1xuICAgICAgICByZHNTZWN1cml0eUdyb3VwLmFkZEluZ3Jlc3NSdWxlKFBlZXIuYW55SXB2NCgpLCBQb3J0LnRjcCgzMzA2KSwgJ0FsbG93IE15U1FMIGFjY2VzcyBmcm9tIGFsbCBJUHY0Jyk7XG5cbiAgICAgICAgY29uc3QgcmRzQ2x1c3RlciA9IG5ldyBEYXRhYmFzZUNsdXN0ZXIodGhpcywgJ1Jkc0F1cm9yYUFkb3RQeXRob25FMkVDbHVzdGVyRm9yTXlTUUwnLCB7XG4gICAgICAgICAgICBlbmdpbmU6IERhdGFiYXNlQ2x1c3RlckVuZ2luZS5hdXJvcmFNeXNxbCh7IHZlcnNpb246IEF1cm9yYU15c3FsRW5naW5lVmVyc2lvbi5WRVJfM18wNF8xIH0pLFxuICAgICAgICAgICAgY2x1c3RlcklkZW50aWZpZXI6ICdSZHNBdXJvcmFBZG90UHl0aG9uRTJFQ2x1c3RlckZvck15U1FMJyxcbiAgICAgICAgICAgIHN0b3JhZ2VUeXBlOiBEQkNsdXN0ZXJTdG9yYWdlVHlwZS5BVVJPUkEsXG4gICAgICAgICAgICB2cGM6IGNsdXN0ZXIudnBjLFxuICAgICAgICAgICAgd3JpdGVyOiBDbHVzdGVySW5zdGFuY2UucHJvdmlzaW9uZWQoJ3dyaXRlcicpLFxuICAgICAgICAgICAgcmVhZGVyczogW0NsdXN0ZXJJbnN0YW5jZS5wcm92aXNpb25lZCgncmVhZGVyJyldLFxuICAgICAgICAgICAgZGVsZXRpb25Qcm90ZWN0aW9uOiB0cnVlLFxuICAgICAgICAgICAgc3RvcmFnZUVuY3J5cHRlZDogdHJ1ZSxcbiAgICAgICAgICAgIHNlY3VyaXR5R3JvdXBzOiBbcmRzU2VjdXJpdHlHcm91cF0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHJkc0NsdXN0ZXJMMUNvbnN0cnVjdCA9IHJkc0NsdXN0ZXIubm9kZS5kZWZhdWx0Q2hpbGQgYXMgQ2ZuREJDbHVzdGVyO1xuICAgICAgICByZHNDbHVzdGVyTDFDb25zdHJ1Y3QuYWRkUHJvcGVydHlPdmVycmlkZSgnTWFuYWdlTWFzdGVyVXNlclBhc3N3b3JkJywgdHJ1ZSk7XG4gICAgICAgIHJkc0NsdXN0ZXJMMUNvbnN0cnVjdC5hZGRQcm9wZXJ0eU92ZXJyaWRlKCdNYXN0ZXJVc2VybmFtZScsICdhZG1pbicpO1xuICAgICAgICByZHNDbHVzdGVyTDFDb25zdHJ1Y3QuYWRkUHJvcGVydHlEZWxldGlvbk92ZXJyaWRlKCdNYXN0ZXJVc2VyUGFzc3dvcmQnKTtcbiAgICB9XG59XG4iXX0=