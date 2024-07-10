"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EksPlaygroundStack = void 0;
const pipelines_1 = require("@amzn/pipelines");
const aws_eks_1 = require("aws-cdk-lib/aws-eks");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const aws_ec2_1 = require("aws-cdk-lib/aws-ec2");
const aws_rds_1 = require("aws-cdk-lib/aws-rds");
// This stack allocates the necessary resources for running the E2E EKS Canary in
// https://github.com/aws-observability/aws-application-signals-test-framework/actions/workflows/appsignals-e2e-eks-canary-test.yml
class EksPlaygroundStack extends pipelines_1.DeploymentStack {
    constructor(parent, name, props) {
        super(parent, name, {
            ...props,
            softwareType: pipelines_1.SoftwareType.INFRASTRUCTURE,
        });
        // Retrieve the role that the github repository will be assuming to access the EKS cluster
        const role = aws_iam_1.Role.fromRoleName(this, 'githubProviderRole', 'githubProviderRole');
        // Create an EKS Cluster with a load balancer
        const cluster = new aws_eks_1.Cluster(this, 'e2e-playground', {
            version: aws_eks_1.KubernetesVersion.V1_27,
            clusterName: 'e2e-playground',
            albController: { version: aws_eks_1.AlbControllerVersion.V2_4_7 },
            mastersRole: role,
        });
        // Add OIDC provider config to the cluster
        new aws_eks_1.CfnIdentityProviderConfig(this, 'oidc-provider-configuration', {
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
        const rdsCluster = new aws_rds_1.DatabaseCluster(this, 'RdsAuroraPlaygroundClusterForMySQL', {
            engine: aws_rds_1.DatabaseClusterEngine.auroraMysql({ version: aws_rds_1.AuroraMysqlEngineVersion.VER_3_04_1 }),
            clusterIdentifier: 'RdsAuroraPlaygroundClusterForMySQL',
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
exports.EksPlaygroundStack = EksPlaygroundStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWtzUGxheWdyb3VuZFN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbGliL3N0YWNrcy9la3NQbGF5Z3JvdW5kU3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0NBQWdFO0FBRWhFLGlEQUFrSDtBQUNsSCxpREFBMkM7QUFFM0MsaURBQWdFO0FBQ2hFLGlEQU82QjtBQUU3QixpRkFBaUY7QUFDakYsbUlBQW1JO0FBQ25JLE1BQWEsa0JBQW1CLFNBQVEsMkJBQWU7SUFDbkQsWUFBWSxNQUFXLEVBQUUsSUFBWSxFQUFFLEtBQWlCO1FBQ3BELEtBQUssQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFO1lBQ2hCLEdBQUcsS0FBSztZQUNSLFlBQVksRUFBRSx3QkFBWSxDQUFDLGNBQWM7U0FDNUMsQ0FBQyxDQUFDO1FBRUgsMEZBQTBGO1FBQzFGLE1BQU0sSUFBSSxHQUFHLGNBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLG9CQUFvQixFQUFFLG9CQUFvQixDQUFDLENBQUM7UUFFakYsNkNBQTZDO1FBQzdDLE1BQU0sT0FBTyxHQUFHLElBQUksaUJBQU8sQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUU7WUFDaEQsT0FBTyxFQUFFLDJCQUFpQixDQUFDLEtBQUs7WUFDaEMsV0FBVyxFQUFFLGdCQUFnQjtZQUM3QixhQUFhLEVBQUUsRUFBRSxPQUFPLEVBQUUsOEJBQW9CLENBQUMsTUFBTSxFQUFFO1lBQ3ZELFdBQVcsRUFBRSxJQUFJO1NBQ3BCLENBQUMsQ0FBQztRQUVILDBDQUEwQztRQUMxQyxJQUFJLG1DQUF5QixDQUFDLElBQUksRUFBRSw2QkFBNkIsRUFBRTtZQUMvRCxXQUFXLEVBQUUsT0FBTyxDQUFDLFdBQVc7WUFDaEMsSUFBSSxFQUFFLE1BQU07WUFDWixJQUFJLEVBQUU7Z0JBQ0YsUUFBUSxFQUFFLG1CQUFtQjtnQkFDN0IsU0FBUyxFQUFFLDZDQUE2QzthQUMzRDtTQUNKLENBQUMsQ0FBQztRQUVILE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSx1QkFBYSxDQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRTtZQUNqRSxHQUFHLEVBQUUsT0FBTyxDQUFDLEdBQUc7WUFDaEIsV0FBVyxFQUFFLHVDQUF1QztZQUNwRCxnQkFBZ0IsRUFBRSxJQUFJO1NBQ3pCLENBQUMsQ0FBQztRQUVILDJEQUEyRDtRQUMzRCxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsY0FBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLGNBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsa0NBQWtDLENBQUMsQ0FBQztRQUVwRyxNQUFNLFVBQVUsR0FBRyxJQUFJLHlCQUFlLENBQUMsSUFBSSxFQUFFLG9DQUFvQyxFQUFFO1lBQy9FLE1BQU0sRUFBRSwrQkFBcUIsQ0FBQyxXQUFXLENBQUMsRUFBRSxPQUFPLEVBQUUsa0NBQXdCLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDM0YsaUJBQWlCLEVBQUUsb0NBQW9DO1lBQ3ZELFdBQVcsRUFBRSw4QkFBb0IsQ0FBQyxNQUFNO1lBQ3hDLEdBQUcsRUFBRSxPQUFPLENBQUMsR0FBRztZQUNoQixNQUFNLEVBQUUseUJBQWUsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO1lBQzdDLE9BQU8sRUFBRSxDQUFDLHlCQUFlLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2hELGtCQUFrQixFQUFFLElBQUk7WUFDeEIsZ0JBQWdCLEVBQUUsSUFBSTtZQUN0QixjQUFjLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQztTQUNyQyxDQUFDLENBQUM7UUFFSCxNQUFNLHFCQUFxQixHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsWUFBNEIsQ0FBQztRQUMzRSxxQkFBcUIsQ0FBQyxtQkFBbUIsQ0FBQywwQkFBMEIsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM1RSxxQkFBcUIsQ0FBQyxtQkFBbUIsQ0FBQyxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNyRSxxQkFBcUIsQ0FBQywyQkFBMkIsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0lBQzVFLENBQUM7Q0FDSjtBQXRERCxnREFzREMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEZXBsb3ltZW50U3RhY2ssIFNvZnR3YXJlVHlwZSB9IGZyb20gJ0BhbXpuL3BpcGVsaW5lcyc7XG5pbXBvcnQgeyBBcHAgfSBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBDbHVzdGVyLCBLdWJlcm5ldGVzVmVyc2lvbiwgQWxiQ29udHJvbGxlclZlcnNpb24sIENmbklkZW50aXR5UHJvdmlkZXJDb25maWcgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWtzJztcbmltcG9ydCB7IFJvbGUgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcbmltcG9ydCB7IFN0YWNrUHJvcHMgfSBmcm9tICcuLi91dGlscy9jb21tb24nO1xuaW1wb3J0IHsgUGVlciwgUG9ydCwgU2VjdXJpdHlHcm91cCB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1lYzInO1xuaW1wb3J0IHtcbiAgICBBdXJvcmFNeXNxbEVuZ2luZVZlcnNpb24sXG4gICAgQ2ZuREJDbHVzdGVyLFxuICAgIENsdXN0ZXJJbnN0YW5jZSxcbiAgICBEQkNsdXN0ZXJTdG9yYWdlVHlwZSxcbiAgICBEYXRhYmFzZUNsdXN0ZXIsXG4gICAgRGF0YWJhc2VDbHVzdGVyRW5naW5lLFxufSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtcmRzJztcblxuLy8gVGhpcyBzdGFjayBhbGxvY2F0ZXMgdGhlIG5lY2Vzc2FyeSByZXNvdXJjZXMgZm9yIHJ1bm5pbmcgdGhlIEUyRSBFS1MgQ2FuYXJ5IGluXG4vLyBodHRwczovL2dpdGh1Yi5jb20vYXdzLW9ic2VydmFiaWxpdHkvYXdzLWFwcGxpY2F0aW9uLXNpZ25hbHMtdGVzdC1mcmFtZXdvcmsvYWN0aW9ucy93b3JrZmxvd3MvYXBwc2lnbmFscy1lMmUtZWtzLWNhbmFyeS10ZXN0LnltbFxuZXhwb3J0IGNsYXNzIEVrc1BsYXlncm91bmRTdGFjayBleHRlbmRzIERlcGxveW1lbnRTdGFjayB7XG4gICAgY29uc3RydWN0b3IocGFyZW50OiBBcHAsIG5hbWU6IHN0cmluZywgcHJvcHM6IFN0YWNrUHJvcHMpIHtcbiAgICAgICAgc3VwZXIocGFyZW50LCBuYW1lLCB7XG4gICAgICAgICAgICAuLi5wcm9wcyxcbiAgICAgICAgICAgIHNvZnR3YXJlVHlwZTogU29mdHdhcmVUeXBlLklORlJBU1RSVUNUVVJFLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBSZXRyaWV2ZSB0aGUgcm9sZSB0aGF0IHRoZSBnaXRodWIgcmVwb3NpdG9yeSB3aWxsIGJlIGFzc3VtaW5nIHRvIGFjY2VzcyB0aGUgRUtTIGNsdXN0ZXJcbiAgICAgICAgY29uc3Qgcm9sZSA9IFJvbGUuZnJvbVJvbGVOYW1lKHRoaXMsICdnaXRodWJQcm92aWRlclJvbGUnLCAnZ2l0aHViUHJvdmlkZXJSb2xlJyk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGFuIEVLUyBDbHVzdGVyIHdpdGggYSBsb2FkIGJhbGFuY2VyXG4gICAgICAgIGNvbnN0IGNsdXN0ZXIgPSBuZXcgQ2x1c3Rlcih0aGlzLCAnZTJlLXBsYXlncm91bmQnLCB7XG4gICAgICAgICAgICB2ZXJzaW9uOiBLdWJlcm5ldGVzVmVyc2lvbi5WMV8yNyxcbiAgICAgICAgICAgIGNsdXN0ZXJOYW1lOiAnZTJlLXBsYXlncm91bmQnLFxuICAgICAgICAgICAgYWxiQ29udHJvbGxlcjogeyB2ZXJzaW9uOiBBbGJDb250cm9sbGVyVmVyc2lvbi5WMl80XzcgfSxcbiAgICAgICAgICAgIG1hc3RlcnNSb2xlOiByb2xlLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBBZGQgT0lEQyBwcm92aWRlciBjb25maWcgdG8gdGhlIGNsdXN0ZXJcbiAgICAgICAgbmV3IENmbklkZW50aXR5UHJvdmlkZXJDb25maWcodGhpcywgJ29pZGMtcHJvdmlkZXItY29uZmlndXJhdGlvbicsIHtcbiAgICAgICAgICAgIGNsdXN0ZXJOYW1lOiBjbHVzdGVyLmNsdXN0ZXJOYW1lLFxuICAgICAgICAgICAgdHlwZTogJ29pZGMnLFxuICAgICAgICAgICAgb2lkYzoge1xuICAgICAgICAgICAgICAgIGNsaWVudElkOiAnc3RzLmFtYXpvbmF3cy5jb20nLFxuICAgICAgICAgICAgICAgIGlzc3VlclVybDogJ2h0dHBzOi8vdG9rZW4uYWN0aW9ucy5naXRodWJ1c2VyY29udGVudC5jb20nLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgcmRzU2VjdXJpdHlHcm91cCA9IG5ldyBTZWN1cml0eUdyb3VwKHRoaXMsICdSZHNTZWN1cml0eUdyb3VwJywge1xuICAgICAgICAgICAgdnBjOiBjbHVzdGVyLnZwYyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnU2VjdXJpdHkgZ3JvdXAgZm9yIFJEUyBBdXJvcmEgY2x1c3RlcicsXG4gICAgICAgICAgICBhbGxvd0FsbE91dGJvdW5kOiB0cnVlLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBBZGQgaW5ncmVzcyBydWxlIHRvIGFsbG93IGFjY2VzcyBmcm9tIGFsbCBJUHY0IGFkZHJlc3Nlc1xuICAgICAgICByZHNTZWN1cml0eUdyb3VwLmFkZEluZ3Jlc3NSdWxlKFBlZXIuYW55SXB2NCgpLCBQb3J0LnRjcCgzMzA2KSwgJ0FsbG93IE15U1FMIGFjY2VzcyBmcm9tIGFsbCBJUHY0Jyk7XG5cbiAgICAgICAgY29uc3QgcmRzQ2x1c3RlciA9IG5ldyBEYXRhYmFzZUNsdXN0ZXIodGhpcywgJ1Jkc0F1cm9yYVBsYXlncm91bmRDbHVzdGVyRm9yTXlTUUwnLCB7XG4gICAgICAgICAgICBlbmdpbmU6IERhdGFiYXNlQ2x1c3RlckVuZ2luZS5hdXJvcmFNeXNxbCh7IHZlcnNpb246IEF1cm9yYU15c3FsRW5naW5lVmVyc2lvbi5WRVJfM18wNF8xIH0pLFxuICAgICAgICAgICAgY2x1c3RlcklkZW50aWZpZXI6ICdSZHNBdXJvcmFQbGF5Z3JvdW5kQ2x1c3RlckZvck15U1FMJyxcbiAgICAgICAgICAgIHN0b3JhZ2VUeXBlOiBEQkNsdXN0ZXJTdG9yYWdlVHlwZS5BVVJPUkEsXG4gICAgICAgICAgICB2cGM6IGNsdXN0ZXIudnBjLFxuICAgICAgICAgICAgd3JpdGVyOiBDbHVzdGVySW5zdGFuY2UucHJvdmlzaW9uZWQoJ3dyaXRlcicpLFxuICAgICAgICAgICAgcmVhZGVyczogW0NsdXN0ZXJJbnN0YW5jZS5wcm92aXNpb25lZCgncmVhZGVyJyldLFxuICAgICAgICAgICAgZGVsZXRpb25Qcm90ZWN0aW9uOiB0cnVlLFxuICAgICAgICAgICAgc3RvcmFnZUVuY3J5cHRlZDogdHJ1ZSxcbiAgICAgICAgICAgIHNlY3VyaXR5R3JvdXBzOiBbcmRzU2VjdXJpdHlHcm91cF0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHJkc0NsdXN0ZXJMMUNvbnN0cnVjdCA9IHJkc0NsdXN0ZXIubm9kZS5kZWZhdWx0Q2hpbGQgYXMgQ2ZuREJDbHVzdGVyO1xuICAgICAgICByZHNDbHVzdGVyTDFDb25zdHJ1Y3QuYWRkUHJvcGVydHlPdmVycmlkZSgnTWFuYWdlTWFzdGVyVXNlclBhc3N3b3JkJywgdHJ1ZSk7XG4gICAgICAgIHJkc0NsdXN0ZXJMMUNvbnN0cnVjdC5hZGRQcm9wZXJ0eU92ZXJyaWRlKCdNYXN0ZXJVc2VybmFtZScsICdhZG1pbicpO1xuICAgICAgICByZHNDbHVzdGVyTDFDb25zdHJ1Y3QuYWRkUHJvcGVydHlEZWxldGlvbk92ZXJyaWRlKCdNYXN0ZXJVc2VyUGFzc3dvcmQnKTtcbiAgICB9XG59XG4iXX0=