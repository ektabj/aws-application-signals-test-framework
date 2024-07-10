"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EksDotnetTestStack = void 0;
const pipelines_1 = require("@amzn/pipelines");
const aws_ecr_1 = require("aws-cdk-lib/aws-ecr");
const aws_eks_1 = require("aws-cdk-lib/aws-eks");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const aws_ec2_1 = require("aws-cdk-lib/aws-ec2");
const aws_rds_1 = require("aws-cdk-lib/aws-rds");
const eks_cluster_1 = require("../constructs/eks-cluster");
// This stack allocates the necessary resources for running the E2E EKS Canary in
// https://github.com/aws-observability/aws-application-signals-test-framework/actions/workflows/appsignals-e2e-eks-canary-test.yml
class EksDotnetTestStack extends pipelines_1.DeploymentStack {
    constructor(parent, name, props) {
        super(parent, name, {
            ...props,
            softwareType: pipelines_1.SoftwareType.INFRASTRUCTURE,
        });
        // Retrieve the role that the github repository will be assuming to access the EKS cluster
        const role = aws_iam_1.Role.fromRoleName(this, 'githubProviderRole', 'githubProviderRole');
        const cluster = new eks_cluster_1.EKSCluster(this, 'e2e-dotnet-canary-test', props.env.region, role);
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
        new aws_ecr_1.Repository(this, 'e2e-eks-dotnet-main-service-repository', {
            repositoryName: 'appsignals-dotnet-main-service',
        });
        new aws_ecr_1.Repository(this, 'e2e-eks-dotnet-remote-service-repository', {
            repositoryName: 'appsignals-dotnet-remote-service',
        });
        const rdsSecurityGroup = new aws_ec2_1.SecurityGroup(this, 'RdsSecurityGroup', {
            vpc: cluster.vpc,
            description: 'Security group for RDS Aurora cluster',
            allowAllOutbound: true,
        });
        // Add ingress rule to allow access from all IPv4 addresses
        rdsSecurityGroup.addIngressRule(aws_ec2_1.Peer.anyIpv4(), aws_ec2_1.Port.tcp(3306), 'Allow MySQL access from all IPv4');
        const rdsCluster = new aws_rds_1.DatabaseCluster(this, 'RdsAuroraDotnetClusterForMySQL', {
            engine: aws_rds_1.DatabaseClusterEngine.auroraMysql({ version: aws_rds_1.AuroraMysqlEngineVersion.VER_3_04_1 }),
            clusterIdentifier: 'RdsAuroraDotnetClusterForMySQL',
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
exports.EksDotnetTestStack = EksDotnetTestStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWtzRG90bmV0VGVzdFN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbGliL3N0YWNrcy9la3NEb3RuZXRUZXN0U3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0NBQWdFO0FBRWhFLGlEQUFpRDtBQUNqRCxpREFBZ0U7QUFDaEUsaURBQTJDO0FBRTNDLGlEQUFnRTtBQUNoRSxpREFPNkI7QUFDN0IsMkRBQXVEO0FBRXZELGlGQUFpRjtBQUNqRixtSUFBbUk7QUFDbkksTUFBYSxrQkFBbUIsU0FBUSwyQkFBZTtJQUNuRCxZQUFZLE1BQVcsRUFBRSxJQUFZLEVBQUUsS0FBaUI7UUFDcEQsS0FBSyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUU7WUFDaEIsR0FBRyxLQUFLO1lBQ1IsWUFBWSxFQUFFLHdCQUFZLENBQUMsY0FBYztTQUM1QyxDQUFDLENBQUM7UUFFSCwwRkFBMEY7UUFDMUYsTUFBTSxJQUFJLEdBQUcsY0FBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsb0JBQW9CLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztRQUNqRixNQUFNLE9BQU8sR0FBRyxJQUFJLHdCQUFVLENBQUMsSUFBSSxFQUFFLHdCQUF3QixFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRXZGLDBDQUEwQztRQUMxQyxJQUFJLG1DQUF5QixDQUFDLElBQUksRUFBRSw2QkFBNkIsRUFBRTtZQUMvRCxXQUFXLEVBQUUsT0FBTyxDQUFDLFdBQVc7WUFDaEMsSUFBSSxFQUFFLE1BQU07WUFDWixJQUFJLEVBQUU7Z0JBQ0YsUUFBUSxFQUFFLG1CQUFtQjtnQkFDN0IsU0FBUyxFQUFFLDZDQUE2QzthQUMzRDtTQUNKLENBQUMsQ0FBQztRQUVILDJHQUEyRztRQUMzRyxJQUFJLG9CQUFVLENBQUMsSUFBSSxFQUFFLHdDQUF3QyxFQUFFO1lBQzNELGNBQWMsRUFBRSxnQ0FBZ0M7U0FDbkQsQ0FBQyxDQUFDO1FBRUgsSUFBSSxvQkFBVSxDQUFDLElBQUksRUFBRSwwQ0FBMEMsRUFBRTtZQUM3RCxjQUFjLEVBQUUsa0NBQWtDO1NBQ3JELENBQUMsQ0FBQztRQUVILE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSx1QkFBYSxDQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRTtZQUNqRSxHQUFHLEVBQUUsT0FBTyxDQUFDLEdBQUc7WUFDaEIsV0FBVyxFQUFFLHVDQUF1QztZQUNwRCxnQkFBZ0IsRUFBRSxJQUFJO1NBQ3pCLENBQUMsQ0FBQztRQUVILDJEQUEyRDtRQUMzRCxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsY0FBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLGNBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsa0NBQWtDLENBQUMsQ0FBQztRQUVwRyxNQUFNLFVBQVUsR0FBRyxJQUFJLHlCQUFlLENBQUMsSUFBSSxFQUFFLGdDQUFnQyxFQUFFO1lBQzNFLE1BQU0sRUFBRSwrQkFBcUIsQ0FBQyxXQUFXLENBQUMsRUFBRSxPQUFPLEVBQUUsa0NBQXdCLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDM0YsaUJBQWlCLEVBQUUsZ0NBQWdDO1lBQ25ELFdBQVcsRUFBRSw4QkFBb0IsQ0FBQyxNQUFNO1lBQ3hDLEdBQUcsRUFBRSxPQUFPLENBQUMsR0FBRztZQUNoQixNQUFNLEVBQUUseUJBQWUsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO1lBQzdDLE9BQU8sRUFBRSxDQUFDLHlCQUFlLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2hELGtCQUFrQixFQUFFLElBQUk7WUFDeEIsZ0JBQWdCLEVBQUUsSUFBSTtZQUN0QixjQUFjLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQztTQUNyQyxDQUFDLENBQUM7UUFFSCxNQUFNLHFCQUFxQixHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsWUFBNEIsQ0FBQztRQUMzRSxxQkFBcUIsQ0FBQyxtQkFBbUIsQ0FBQywwQkFBMEIsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM1RSxxQkFBcUIsQ0FBQyxtQkFBbUIsQ0FBQyxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNyRSxxQkFBcUIsQ0FBQywyQkFBMkIsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0lBQzVFLENBQUM7Q0FDSjtBQXhERCxnREF3REMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEZXBsb3ltZW50U3RhY2ssIFNvZnR3YXJlVHlwZSB9IGZyb20gJ0BhbXpuL3BpcGVsaW5lcyc7XG5pbXBvcnQgeyBBcHAgfSBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBSZXBvc2l0b3J5IH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWVjcic7XG5pbXBvcnQgeyBDZm5JZGVudGl0eVByb3ZpZGVyQ29uZmlnIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWVrcyc7XG5pbXBvcnQgeyBSb2xlIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWlhbSc7XG5pbXBvcnQgeyBTdGFja1Byb3BzIH0gZnJvbSAnLi4vdXRpbHMvY29tbW9uJztcbmltcG9ydCB7IFBlZXIsIFBvcnQsIFNlY3VyaXR5R3JvdXAgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWMyJztcbmltcG9ydCB7XG4gICAgQXVyb3JhTXlzcWxFbmdpbmVWZXJzaW9uLFxuICAgIENmbkRCQ2x1c3RlcixcbiAgICBDbHVzdGVySW5zdGFuY2UsXG4gICAgREJDbHVzdGVyU3RvcmFnZVR5cGUsXG4gICAgRGF0YWJhc2VDbHVzdGVyLFxuICAgIERhdGFiYXNlQ2x1c3RlckVuZ2luZSxcbn0gZnJvbSAnYXdzLWNkay1saWIvYXdzLXJkcyc7XG5pbXBvcnQgeyBFS1NDbHVzdGVyIH0gZnJvbSAnLi4vY29uc3RydWN0cy9la3MtY2x1c3Rlcic7XG5cbi8vIFRoaXMgc3RhY2sgYWxsb2NhdGVzIHRoZSBuZWNlc3NhcnkgcmVzb3VyY2VzIGZvciBydW5uaW5nIHRoZSBFMkUgRUtTIENhbmFyeSBpblxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2F3cy1vYnNlcnZhYmlsaXR5L2F3cy1hcHBsaWNhdGlvbi1zaWduYWxzLXRlc3QtZnJhbWV3b3JrL2FjdGlvbnMvd29ya2Zsb3dzL2FwcHNpZ25hbHMtZTJlLWVrcy1jYW5hcnktdGVzdC55bWxcbmV4cG9ydCBjbGFzcyBFa3NEb3RuZXRUZXN0U3RhY2sgZXh0ZW5kcyBEZXBsb3ltZW50U3RhY2sge1xuICAgIGNvbnN0cnVjdG9yKHBhcmVudDogQXBwLCBuYW1lOiBzdHJpbmcsIHByb3BzOiBTdGFja1Byb3BzKSB7XG4gICAgICAgIHN1cGVyKHBhcmVudCwgbmFtZSwge1xuICAgICAgICAgICAgLi4ucHJvcHMsXG4gICAgICAgICAgICBzb2Z0d2FyZVR5cGU6IFNvZnR3YXJlVHlwZS5JTkZSQVNUUlVDVFVSRSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gUmV0cmlldmUgdGhlIHJvbGUgdGhhdCB0aGUgZ2l0aHViIHJlcG9zaXRvcnkgd2lsbCBiZSBhc3N1bWluZyB0byBhY2Nlc3MgdGhlIEVLUyBjbHVzdGVyXG4gICAgICAgIGNvbnN0IHJvbGUgPSBSb2xlLmZyb21Sb2xlTmFtZSh0aGlzLCAnZ2l0aHViUHJvdmlkZXJSb2xlJywgJ2dpdGh1YlByb3ZpZGVyUm9sZScpO1xuICAgICAgICBjb25zdCBjbHVzdGVyID0gbmV3IEVLU0NsdXN0ZXIodGhpcywgJ2UyZS1kb3RuZXQtY2FuYXJ5LXRlc3QnLCBwcm9wcy5lbnYucmVnaW9uLCByb2xlKTtcblxuICAgICAgICAvLyBBZGQgT0lEQyBwcm92aWRlciBjb25maWcgdG8gdGhlIGNsdXN0ZXJcbiAgICAgICAgbmV3IENmbklkZW50aXR5UHJvdmlkZXJDb25maWcodGhpcywgJ29pZGMtcHJvdmlkZXItY29uZmlndXJhdGlvbicsIHtcbiAgICAgICAgICAgIGNsdXN0ZXJOYW1lOiBjbHVzdGVyLmNsdXN0ZXJOYW1lLFxuICAgICAgICAgICAgdHlwZTogJ29pZGMnLFxuICAgICAgICAgICAgb2lkYzoge1xuICAgICAgICAgICAgICAgIGNsaWVudElkOiAnc3RzLmFtYXpvbmF3cy5jb20nLFxuICAgICAgICAgICAgICAgIGlzc3VlclVybDogJ2h0dHBzOi8vdG9rZW4uYWN0aW9ucy5naXRodWJ1c2VyY29udGVudC5jb20nLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIHR3byBFQ1JzLCBvbmUgdG8gc3RvcmUgdGhlIG1haW4gc2FtcGxlIGFwcCBpbWFnZSBhbmQgYW5vdGhlciB0byBzdG9yZSB0aGUgcmVtb3RlIHNhbXBsZSBhcHAgaW1hZ2VcbiAgICAgICAgbmV3IFJlcG9zaXRvcnkodGhpcywgJ2UyZS1la3MtZG90bmV0LW1haW4tc2VydmljZS1yZXBvc2l0b3J5Jywge1xuICAgICAgICAgICAgcmVwb3NpdG9yeU5hbWU6ICdhcHBzaWduYWxzLWRvdG5ldC1tYWluLXNlcnZpY2UnLFxuICAgICAgICB9KTtcblxuICAgICAgICBuZXcgUmVwb3NpdG9yeSh0aGlzLCAnZTJlLWVrcy1kb3RuZXQtcmVtb3RlLXNlcnZpY2UtcmVwb3NpdG9yeScsIHtcbiAgICAgICAgICAgIHJlcG9zaXRvcnlOYW1lOiAnYXBwc2lnbmFscy1kb3RuZXQtcmVtb3RlLXNlcnZpY2UnLFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCByZHNTZWN1cml0eUdyb3VwID0gbmV3IFNlY3VyaXR5R3JvdXAodGhpcywgJ1Jkc1NlY3VyaXR5R3JvdXAnLCB7XG4gICAgICAgICAgICB2cGM6IGNsdXN0ZXIudnBjLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdTZWN1cml0eSBncm91cCBmb3IgUkRTIEF1cm9yYSBjbHVzdGVyJyxcbiAgICAgICAgICAgIGFsbG93QWxsT3V0Ym91bmQ6IHRydWUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEFkZCBpbmdyZXNzIHJ1bGUgdG8gYWxsb3cgYWNjZXNzIGZyb20gYWxsIElQdjQgYWRkcmVzc2VzXG4gICAgICAgIHJkc1NlY3VyaXR5R3JvdXAuYWRkSW5ncmVzc1J1bGUoUGVlci5hbnlJcHY0KCksIFBvcnQudGNwKDMzMDYpLCAnQWxsb3cgTXlTUUwgYWNjZXNzIGZyb20gYWxsIElQdjQnKTtcblxuICAgICAgICBjb25zdCByZHNDbHVzdGVyID0gbmV3IERhdGFiYXNlQ2x1c3Rlcih0aGlzLCAnUmRzQXVyb3JhRG90bmV0Q2x1c3RlckZvck15U1FMJywge1xuICAgICAgICAgICAgZW5naW5lOiBEYXRhYmFzZUNsdXN0ZXJFbmdpbmUuYXVyb3JhTXlzcWwoeyB2ZXJzaW9uOiBBdXJvcmFNeXNxbEVuZ2luZVZlcnNpb24uVkVSXzNfMDRfMSB9KSxcbiAgICAgICAgICAgIGNsdXN0ZXJJZGVudGlmaWVyOiAnUmRzQXVyb3JhRG90bmV0Q2x1c3RlckZvck15U1FMJyxcbiAgICAgICAgICAgIHN0b3JhZ2VUeXBlOiBEQkNsdXN0ZXJTdG9yYWdlVHlwZS5BVVJPUkEsXG4gICAgICAgICAgICB2cGM6IGNsdXN0ZXIudnBjLFxuICAgICAgICAgICAgd3JpdGVyOiBDbHVzdGVySW5zdGFuY2UucHJvdmlzaW9uZWQoJ3dyaXRlcicpLFxuICAgICAgICAgICAgcmVhZGVyczogW0NsdXN0ZXJJbnN0YW5jZS5wcm92aXNpb25lZCgncmVhZGVyJyldLFxuICAgICAgICAgICAgZGVsZXRpb25Qcm90ZWN0aW9uOiB0cnVlLFxuICAgICAgICAgICAgc3RvcmFnZUVuY3J5cHRlZDogdHJ1ZSxcbiAgICAgICAgICAgIHNlY3VyaXR5R3JvdXBzOiBbcmRzU2VjdXJpdHlHcm91cF0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHJkc0NsdXN0ZXJMMUNvbnN0cnVjdCA9IHJkc0NsdXN0ZXIubm9kZS5kZWZhdWx0Q2hpbGQgYXMgQ2ZuREJDbHVzdGVyO1xuICAgICAgICByZHNDbHVzdGVyTDFDb25zdHJ1Y3QuYWRkUHJvcGVydHlPdmVycmlkZSgnTWFuYWdlTWFzdGVyVXNlclBhc3N3b3JkJywgdHJ1ZSk7XG4gICAgICAgIHJkc0NsdXN0ZXJMMUNvbnN0cnVjdC5hZGRQcm9wZXJ0eU92ZXJyaWRlKCdNYXN0ZXJVc2VybmFtZScsICdhZG1pbicpO1xuICAgICAgICByZHNDbHVzdGVyTDFDb25zdHJ1Y3QuYWRkUHJvcGVydHlEZWxldGlvbk92ZXJyaWRlKCdNYXN0ZXJVc2VyUGFzc3dvcmQnKTtcbiAgICB9XG59XG4iXX0=