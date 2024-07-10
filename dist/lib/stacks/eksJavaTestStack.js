"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EksJavaTestStack = void 0;
const pipelines_1 = require("@amzn/pipelines");
const aws_ecr_1 = require("aws-cdk-lib/aws-ecr");
const aws_eks_1 = require("aws-cdk-lib/aws-eks");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const aws_ec2_1 = require("aws-cdk-lib/aws-ec2");
const aws_rds_1 = require("aws-cdk-lib/aws-rds");
const eks_cluster_1 = require("../constructs/eks-cluster");
// This stack allocates the necessary resources for running the E2E EKS Canary in
// https://github.com/aws-observability/aws-application-signals-test-framework/actions/workflows/appsignals-e2e-eks-canary-test.yml
class EksJavaTestStack extends pipelines_1.DeploymentStack {
    constructor(parent, name, props) {
        super(parent, name, {
            ...props,
            softwareType: pipelines_1.SoftwareType.INFRASTRUCTURE,
        });
        // Retrieve the role that the github repository will be assuming to access the EKS cluster
        const role = aws_iam_1.Role.fromRoleName(this, 'githubProviderRole', 'githubProviderRole');
        const cluster = new eks_cluster_1.EKSCluster(this, 'e2e-canary-test', props.env.region, role);
        // Add OIDC provider config to the cluster
        new aws_eks_1.CfnIdentityProviderConfig(this, 'oidc-provider-configuration', {
            clusterName: cluster.clusterName,
            type: 'oidc',
            oidc: {
                clientId: 'sts.amazonaws.com',
                issuerUrl: 'https://token.actions.githubusercontent.com',
            },
        });
        // Create two ECRs, one to store the main sample app image and another to store the remote sample app image
        new aws_ecr_1.Repository(this, 'e2e-eks-main-service-repository', {
            repositoryName: 'appsignals-java-springboot-main-service',
        });
        new aws_ecr_1.Repository(this, 'e2e-eks-remote-service-repository', {
            repositoryName: 'appsignals-java-springboot-remote-service',
        });
        const rdsSecurityGroup = new aws_ec2_1.SecurityGroup(this, 'RdsSecurityGroup', {
            vpc: cluster.vpc,
            description: 'Security group for RDS Aurora cluster',
            allowAllOutbound: true,
        });
        // Add ingress rule to allow access from all IPv4 addresses
        rdsSecurityGroup.addIngressRule(aws_ec2_1.Peer.anyIpv4(), aws_ec2_1.Port.tcp(3306), 'Allow MySQL access from all IPv4');
        const rdsCluster = new aws_rds_1.DatabaseCluster(this, 'RdsAuroraJavaClusterForMySQL', {
            engine: aws_rds_1.DatabaseClusterEngine.auroraMysql({ version: aws_rds_1.AuroraMysqlEngineVersion.VER_3_04_1 }),
            clusterIdentifier: 'RdsAuroraJavaClusterForMySQL',
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
exports.EksJavaTestStack = EksJavaTestStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWtzSmF2YVRlc3RTdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9zdGFja3MvZWtzSmF2YVRlc3RTdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrQ0FBZ0U7QUFFaEUsaURBQWlEO0FBQ2pELGlEQUFnRTtBQUNoRSxpREFBMkM7QUFFM0MsaURBQWdFO0FBQ2hFLGlEQU82QjtBQUM3QiwyREFBdUQ7QUFFdkQsaUZBQWlGO0FBQ2pGLG1JQUFtSTtBQUNuSSxNQUFhLGdCQUFpQixTQUFRLDJCQUFlO0lBQ2pELFlBQVksTUFBVyxFQUFFLElBQVksRUFBRSxLQUFpQjtRQUNwRCxLQUFLLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRTtZQUNoQixHQUFHLEtBQUs7WUFDUixZQUFZLEVBQUUsd0JBQVksQ0FBQyxjQUFjO1NBQzVDLENBQUMsQ0FBQztRQUVILDBGQUEwRjtRQUMxRixNQUFNLElBQUksR0FBRyxjQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1FBQ2pGLE1BQU0sT0FBTyxHQUFHLElBQUksd0JBQVUsQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFaEYsMENBQTBDO1FBQzFDLElBQUksbUNBQXlCLENBQUMsSUFBSSxFQUFFLDZCQUE2QixFQUFFO1lBQy9ELFdBQVcsRUFBRSxPQUFPLENBQUMsV0FBVztZQUNoQyxJQUFJLEVBQUUsTUFBTTtZQUNaLElBQUksRUFBRTtnQkFDRixRQUFRLEVBQUUsbUJBQW1CO2dCQUM3QixTQUFTLEVBQUUsNkNBQTZDO2FBQzNEO1NBQ0osQ0FBQyxDQUFDO1FBRUgsMkdBQTJHO1FBQzNHLElBQUksb0JBQVUsQ0FBQyxJQUFJLEVBQUUsaUNBQWlDLEVBQUU7WUFDcEQsY0FBYyxFQUFFLHlDQUF5QztTQUM1RCxDQUFDLENBQUM7UUFFSCxJQUFJLG9CQUFVLENBQUMsSUFBSSxFQUFFLG1DQUFtQyxFQUFFO1lBQ3RELGNBQWMsRUFBRSwyQ0FBMkM7U0FDOUQsQ0FBQyxDQUFDO1FBRUgsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLHVCQUFhLENBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFO1lBQ2pFLEdBQUcsRUFBRSxPQUFPLENBQUMsR0FBRztZQUNoQixXQUFXLEVBQUUsdUNBQXVDO1lBQ3BELGdCQUFnQixFQUFFLElBQUk7U0FDekIsQ0FBQyxDQUFDO1FBRUgsMkRBQTJEO1FBQzNELGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxjQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsY0FBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxrQ0FBa0MsQ0FBQyxDQUFDO1FBRXBHLE1BQU0sVUFBVSxHQUFHLElBQUkseUJBQWUsQ0FBQyxJQUFJLEVBQUUsOEJBQThCLEVBQUU7WUFDekUsTUFBTSxFQUFFLCtCQUFxQixDQUFDLFdBQVcsQ0FBQyxFQUFFLE9BQU8sRUFBRSxrQ0FBd0IsQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUMzRixpQkFBaUIsRUFBRSw4QkFBOEI7WUFDakQsV0FBVyxFQUFFLDhCQUFvQixDQUFDLE1BQU07WUFDeEMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxHQUFHO1lBQ2hCLE1BQU0sRUFBRSx5QkFBZSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUM7WUFDN0MsT0FBTyxFQUFFLENBQUMseUJBQWUsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDaEQsa0JBQWtCLEVBQUUsSUFBSTtZQUN4QixnQkFBZ0IsRUFBRSxJQUFJO1lBQ3RCLGNBQWMsRUFBRSxDQUFDLGdCQUFnQixDQUFDO1NBQ3JDLENBQUMsQ0FBQztRQUVILE1BQU0scUJBQXFCLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxZQUE0QixDQUFDO1FBQzNFLHFCQUFxQixDQUFDLG1CQUFtQixDQUFDLDBCQUEwQixFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzVFLHFCQUFxQixDQUFDLG1CQUFtQixDQUFDLGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3JFLHFCQUFxQixDQUFDLDJCQUEyQixDQUFDLG9CQUFvQixDQUFDLENBQUM7SUFDNUUsQ0FBQztDQUNKO0FBeERELDRDQXdEQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERlcGxveW1lbnRTdGFjaywgU29mdHdhcmVUeXBlIH0gZnJvbSAnQGFtem4vcGlwZWxpbmVzJztcbmltcG9ydCB7IEFwcCB9IGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IFJlcG9zaXRvcnkgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWNyJztcbmltcG9ydCB7IENmbklkZW50aXR5UHJvdmlkZXJDb25maWcgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWtzJztcbmltcG9ydCB7IFJvbGUgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcbmltcG9ydCB7IFN0YWNrUHJvcHMgfSBmcm9tICcuLi91dGlscy9jb21tb24nO1xuaW1wb3J0IHsgU2VjdXJpdHlHcm91cCwgUGVlciwgUG9ydCB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1lYzInO1xuaW1wb3J0IHtcbiAgICBBdXJvcmFNeXNxbEVuZ2luZVZlcnNpb24sXG4gICAgQ2ZuREJDbHVzdGVyLFxuICAgIENsdXN0ZXJJbnN0YW5jZSxcbiAgICBEQkNsdXN0ZXJTdG9yYWdlVHlwZSxcbiAgICBEYXRhYmFzZUNsdXN0ZXIsXG4gICAgRGF0YWJhc2VDbHVzdGVyRW5naW5lLFxufSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtcmRzJztcbmltcG9ydCB7IEVLU0NsdXN0ZXIgfSBmcm9tICcuLi9jb25zdHJ1Y3RzL2Vrcy1jbHVzdGVyJztcblxuLy8gVGhpcyBzdGFjayBhbGxvY2F0ZXMgdGhlIG5lY2Vzc2FyeSByZXNvdXJjZXMgZm9yIHJ1bm5pbmcgdGhlIEUyRSBFS1MgQ2FuYXJ5IGluXG4vLyBodHRwczovL2dpdGh1Yi5jb20vYXdzLW9ic2VydmFiaWxpdHkvYXdzLWFwcGxpY2F0aW9uLXNpZ25hbHMtdGVzdC1mcmFtZXdvcmsvYWN0aW9ucy93b3JrZmxvd3MvYXBwc2lnbmFscy1lMmUtZWtzLWNhbmFyeS10ZXN0LnltbFxuZXhwb3J0IGNsYXNzIEVrc0phdmFUZXN0U3RhY2sgZXh0ZW5kcyBEZXBsb3ltZW50U3RhY2sge1xuICAgIGNvbnN0cnVjdG9yKHBhcmVudDogQXBwLCBuYW1lOiBzdHJpbmcsIHByb3BzOiBTdGFja1Byb3BzKSB7XG4gICAgICAgIHN1cGVyKHBhcmVudCwgbmFtZSwge1xuICAgICAgICAgICAgLi4ucHJvcHMsXG4gICAgICAgICAgICBzb2Z0d2FyZVR5cGU6IFNvZnR3YXJlVHlwZS5JTkZSQVNUUlVDVFVSRSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gUmV0cmlldmUgdGhlIHJvbGUgdGhhdCB0aGUgZ2l0aHViIHJlcG9zaXRvcnkgd2lsbCBiZSBhc3N1bWluZyB0byBhY2Nlc3MgdGhlIEVLUyBjbHVzdGVyXG4gICAgICAgIGNvbnN0IHJvbGUgPSBSb2xlLmZyb21Sb2xlTmFtZSh0aGlzLCAnZ2l0aHViUHJvdmlkZXJSb2xlJywgJ2dpdGh1YlByb3ZpZGVyUm9sZScpO1xuICAgICAgICBjb25zdCBjbHVzdGVyID0gbmV3IEVLU0NsdXN0ZXIodGhpcywgJ2UyZS1jYW5hcnktdGVzdCcsIHByb3BzLmVudi5yZWdpb24sIHJvbGUpO1xuXG4gICAgICAgIC8vIEFkZCBPSURDIHByb3ZpZGVyIGNvbmZpZyB0byB0aGUgY2x1c3RlclxuICAgICAgICBuZXcgQ2ZuSWRlbnRpdHlQcm92aWRlckNvbmZpZyh0aGlzLCAnb2lkYy1wcm92aWRlci1jb25maWd1cmF0aW9uJywge1xuICAgICAgICAgICAgY2x1c3Rlck5hbWU6IGNsdXN0ZXIuY2x1c3Rlck5hbWUsXG4gICAgICAgICAgICB0eXBlOiAnb2lkYycsXG4gICAgICAgICAgICBvaWRjOiB7XG4gICAgICAgICAgICAgICAgY2xpZW50SWQ6ICdzdHMuYW1hem9uYXdzLmNvbScsXG4gICAgICAgICAgICAgICAgaXNzdWVyVXJsOiAnaHR0cHM6Ly90b2tlbi5hY3Rpb25zLmdpdGh1YnVzZXJjb250ZW50LmNvbScsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBDcmVhdGUgdHdvIEVDUnMsIG9uZSB0byBzdG9yZSB0aGUgbWFpbiBzYW1wbGUgYXBwIGltYWdlIGFuZCBhbm90aGVyIHRvIHN0b3JlIHRoZSByZW1vdGUgc2FtcGxlIGFwcCBpbWFnZVxuICAgICAgICBuZXcgUmVwb3NpdG9yeSh0aGlzLCAnZTJlLWVrcy1tYWluLXNlcnZpY2UtcmVwb3NpdG9yeScsIHtcbiAgICAgICAgICAgIHJlcG9zaXRvcnlOYW1lOiAnYXBwc2lnbmFscy1qYXZhLXNwcmluZ2Jvb3QtbWFpbi1zZXJ2aWNlJyxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbmV3IFJlcG9zaXRvcnkodGhpcywgJ2UyZS1la3MtcmVtb3RlLXNlcnZpY2UtcmVwb3NpdG9yeScsIHtcbiAgICAgICAgICAgIHJlcG9zaXRvcnlOYW1lOiAnYXBwc2lnbmFscy1qYXZhLXNwcmluZ2Jvb3QtcmVtb3RlLXNlcnZpY2UnLFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCByZHNTZWN1cml0eUdyb3VwID0gbmV3IFNlY3VyaXR5R3JvdXAodGhpcywgJ1Jkc1NlY3VyaXR5R3JvdXAnLCB7XG4gICAgICAgICAgICB2cGM6IGNsdXN0ZXIudnBjLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdTZWN1cml0eSBncm91cCBmb3IgUkRTIEF1cm9yYSBjbHVzdGVyJyxcbiAgICAgICAgICAgIGFsbG93QWxsT3V0Ym91bmQ6IHRydWUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEFkZCBpbmdyZXNzIHJ1bGUgdG8gYWxsb3cgYWNjZXNzIGZyb20gYWxsIElQdjQgYWRkcmVzc2VzXG4gICAgICAgIHJkc1NlY3VyaXR5R3JvdXAuYWRkSW5ncmVzc1J1bGUoUGVlci5hbnlJcHY0KCksIFBvcnQudGNwKDMzMDYpLCAnQWxsb3cgTXlTUUwgYWNjZXNzIGZyb20gYWxsIElQdjQnKTtcblxuICAgICAgICBjb25zdCByZHNDbHVzdGVyID0gbmV3IERhdGFiYXNlQ2x1c3Rlcih0aGlzLCAnUmRzQXVyb3JhSmF2YUNsdXN0ZXJGb3JNeVNRTCcsIHtcbiAgICAgICAgICAgIGVuZ2luZTogRGF0YWJhc2VDbHVzdGVyRW5naW5lLmF1cm9yYU15c3FsKHsgdmVyc2lvbjogQXVyb3JhTXlzcWxFbmdpbmVWZXJzaW9uLlZFUl8zXzA0XzEgfSksXG4gICAgICAgICAgICBjbHVzdGVySWRlbnRpZmllcjogJ1Jkc0F1cm9yYUphdmFDbHVzdGVyRm9yTXlTUUwnLFxuICAgICAgICAgICAgc3RvcmFnZVR5cGU6IERCQ2x1c3RlclN0b3JhZ2VUeXBlLkFVUk9SQSxcbiAgICAgICAgICAgIHZwYzogY2x1c3Rlci52cGMsXG4gICAgICAgICAgICB3cml0ZXI6IENsdXN0ZXJJbnN0YW5jZS5wcm92aXNpb25lZCgnd3JpdGVyJyksXG4gICAgICAgICAgICByZWFkZXJzOiBbQ2x1c3Rlckluc3RhbmNlLnByb3Zpc2lvbmVkKCdyZWFkZXInKV0sXG4gICAgICAgICAgICBkZWxldGlvblByb3RlY3Rpb246IHRydWUsXG4gICAgICAgICAgICBzdG9yYWdlRW5jcnlwdGVkOiB0cnVlLFxuICAgICAgICAgICAgc2VjdXJpdHlHcm91cHM6IFtyZHNTZWN1cml0eUdyb3VwXSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgcmRzQ2x1c3RlckwxQ29uc3RydWN0ID0gcmRzQ2x1c3Rlci5ub2RlLmRlZmF1bHRDaGlsZCBhcyBDZm5EQkNsdXN0ZXI7XG4gICAgICAgIHJkc0NsdXN0ZXJMMUNvbnN0cnVjdC5hZGRQcm9wZXJ0eU92ZXJyaWRlKCdNYW5hZ2VNYXN0ZXJVc2VyUGFzc3dvcmQnLCB0cnVlKTtcbiAgICAgICAgcmRzQ2x1c3RlckwxQ29uc3RydWN0LmFkZFByb3BlcnR5T3ZlcnJpZGUoJ01hc3RlclVzZXJuYW1lJywgJ2FkbWluJyk7XG4gICAgICAgIHJkc0NsdXN0ZXJMMUNvbnN0cnVjdC5hZGRQcm9wZXJ0eURlbGV0aW9uT3ZlcnJpZGUoJ01hc3RlclVzZXJQYXNzd29yZCcpO1xuICAgIH1cbn1cbiJdfQ==